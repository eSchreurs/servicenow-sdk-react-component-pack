import { GlideRecord, GlideTableHierarchy } from '@servicenow/glide'

// Scripted REST API handler — POST /api/x_326171_ssdk_pack/rhino/metadata
// Returns metadata + current values for all requested fields on the given record.
// Uses GlideElementDescriptor for correct mandatory/readOnly resolution (includes
// the full dictionary override chain without manual merging).
// Qualifier config (use_reference_qualifier / reference_qual / dynamic_ref_qual) is
// still read from sys_dictionary with override_reference_qualifier awareness, because
// ed.getRefQualType() and ed.getRefQualString() are not available in scoped apps.
// Returns { result: { [field]: FieldData } } or { result: null, error: string }.
// Requires authentication. Scoped to x_326171_ssdk_pack.

export function process(request: any, response: any): void {
    try {
        var body = request.body.data;
        var table: string = body.table;
        var sysId: string = body.sysId;
        var fields: string[] = body.fields;

        if (!table || !fields || fields.length === 0) {
            response.setBody({ result: null, error: 'table and fields are required' });
            return;
        }

        // 1. Load GlideRecord — values come from the actual record when sysId is present.
        //    initialize() is called for new records to ensure field elements are accessible.
        var gr = new GlideRecord(table);
        if (sysId) {
            gr.get('sys_id', sysId);
        } else {
            gr.initialize();
        }

        // 2. Build full table hierarchy (most-specific-first) for sys_dictionary queries.
        var hierarchy = new GlideTableHierarchy(table);
        var tables = hierarchy.getTables();
        var tableList: string[] = [];
        for (var i = 0; i < tables.length; i++) {
            tableList.push(tables[i].toString());
        }
        if (tableList.length > 0 && tableList[0] !== table) {
            tableList.reverse();
        }

        // 3. Batch sys_dictionary query — qualifier config for all requested fields.
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addQuery('name', 'IN', tableList.join(','));
        dictGR.addQuery('element', 'IN', fields.join(','));
        dictGR.query();

        // Group rows by field name; within each group sort most-specific-first.
        var qualRows: Record<string, any[]> = {};
        while (dictGR.next()) {
            var fieldName: string = dictGR.getValue('element') || '';
            if (!fieldName) continue;
            if (!qualRows[fieldName]) qualRows[fieldName] = [];
            qualRows[fieldName].push({
                tableName: dictGR.getValue('name') || '',
                useReferenceQualifier: dictGR.getValue('use_reference_qualifier') || '',
                referenceQual: dictGR.getValue('reference_qual') || '',
                dynamicRefQual: dictGR.getValue('dynamic_ref_qual') || '',
                overrideReferenceQualifier: dictGR.getValue('override_reference_qualifier') || '',
            });
        }

        // Resolve the authoritative qualifier row for a field (override-aware).
        function resolveQualifierConfig(rows: any[]): any {
            var sorted = rows.slice().sort(function(a: any, b: any) {
                var ai = tableList.indexOf(a.tableName);
                var bi = tableList.indexOf(b.tableName);
                return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
            });
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].overrideReferenceQualifier === 'true') {
                    return sorted[j];
                }
            }
            return sorted[sorted.length - 1] || {};
        }

        // 4. Batch sys_choice query — for all choice fields in one pass.
        var language: string = 'en';
        var choiceRows: Record<string, any[]> = {};

        var choiceGR = new GlideRecord('sys_choice');
        choiceGR.addQuery('name', 'IN', tableList.join(','));
        choiceGR.addQuery('element', 'IN', fields.join(','));
        choiceGR.addQuery('language', language);
        choiceGR.query();

        while (choiceGR.next()) {
            var cfField: string = choiceGR.getValue('element') || '';
            var cfTable: string = choiceGR.getValue('name') || '';
            if (!cfField || !cfTable) continue;
            if (!choiceRows[cfField]) choiceRows[cfField] = [];
            choiceRows[cfField].push({
                tableName: cfTable,
                value: choiceGR.getValue('value') || '',
                label: choiceGR.getValue('label') || '',
                dependentValue: choiceGR.getValue('dependent_value') || '',
                sequence: parseInt(choiceGR.getValue('sequence') || '0', 10),
            });
        }

        // For each choice field, keep only rows from the most-specific table that has entries,
        // then sort by sequence.
        function resolveChoices(fName: string): any[] {
            var rows = choiceRows[fName];
            if (!rows || rows.length === 0) return [];
            // Find most-specific table with entries.
            var chosen: any[] | undefined;
            for (var t = 0; t < tableList.length; t++) {
                var tableChoices = rows.filter(function(r: any) { return r.tableName === tableList[t]; });
                if (tableChoices.length > 0) {
                    chosen = tableChoices;
                    break;
                }
            }
            if (!chosen) return [];
            chosen.sort(function(a: any, b: any) { return a.sequence - b.sequence; });
            return chosen.map(function(r: any) {
                var entry: any = { value: r.value, label: r.label };
                if (r.dependentValue) entry.dependentValue = r.dependentValue;
                return entry;
            });
        }

        // 5. Build result using GlideElementDescriptor for each field.
        var result: Record<string, any> = {};

        for (var f = 0; f < fields.length; f++) {
            var fName = fields[f];
            try {
                // Access the field as a property — the standard ServiceNow pattern for
                // obtaining a GlideElement from a GlideRecord. getElement() is not used
                // because it is not reliably available in scoped Scripted REST API context.
                var el = (gr as any)[fName];
                var ed = el.getED();

                var label: string = ed.getLabel() || fName;
                var mandatory: boolean = ed.isMandatory();
                var readOnly: boolean = ed.isReadOnly();
                var maxLength: number = ed.getLength() || 0;
                var type: string = ed.getInternalType() || 'string';
                var isChoiceField: boolean = ed.isChoiceTable();
                var reference: string = ed.getReference() || '';

                var value: string = '';
                var displayValue: string = '';
                if (sysId) {
                    value = gr.getValue(fName) || '';
                    displayValue = gr.getDisplayValue(fName) || value;
                }

                var fieldData: any = {
                    name: fName,
                    label: label,
                    mandatory: mandatory,
                    readOnly: readOnly,
                    maxLength: maxLength,
                    type: type,
                    isChoiceField: isChoiceField,
                    choices: isChoiceField ? resolveChoices(fName) : [],
                    value: value,
                    displayValue: displayValue,
                };

                if (reference) fieldData.reference = reference;

                // Qualifier config from sys_dictionary (override-aware).
                if (reference && qualRows[fName]) {
                    var qc = resolveQualifierConfig(qualRows[fName]);
                    var qt: string = qc.useReferenceQualifier || '';
                    if (qt === 'simple' || qt === 'dynamic' || qt === 'advanced') {
                        fieldData.useReferenceQualifier = qt;
                    }
                    if (qc.referenceQual) fieldData.referenceQual = qc.referenceQual;
                    if (qc.dynamicRefQual) fieldData.dynamicRefQual = qc.dynamicRefQual;
                }

                result[fName] = fieldData;
            } catch (fieldErr) {
                // Unknown field — skip silently.
            }
        }

        response.setBody({ result: result });

    } catch (e) {
        response.setBody({ result: null, error: String(e) });
    }
}
