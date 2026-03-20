import { GlideRecord, GlideTableHierarchy } from '@servicenow/glide'

// Scripted REST API handler — POST /api/x_326171_ssdk_pack/rhino/metadata
// Returns metadata + current values for all requested fields on the given record.
//
// Metadata is resolved from sys_dictionary using the full table hierarchy so that
// dictionary overrides (override_mandatory, override_read_only,
// override_reference_qualifier) are applied correctly.
// Qualifier config (use_reference_qualifier / reference_qual / dynamic_ref_qual)
// is also read from sys_dictionary with override_reference_qualifier awareness.
// Choice lists are resolved from sys_choice (whole-table replacement semantics).
//
// Note: GlideElementDescriptor (getED()) is not available in scoped Scripted REST
// API context, so all metadata is derived from direct sys_dictionary queries.
//
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

        // 1. Load GlideRecord for value retrieval.
        var gr = new GlideRecord(table);
        var recordLoaded = false;
        if (sysId) {
            recordLoaded = gr.get('sys_id', sysId);
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

        // 3. Single sys_dictionary query — all metadata fields including override flags.
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addQuery('name', 'IN', tableList.join(','));
        dictGR.addQuery('element', 'IN', fields.join(','));
        dictGR.query();

        var fieldRows: Record<string, any[]> = {};
        while (dictGR.next()) {
            var fn: string = dictGR.getValue('element') || '';
            if (!fn) continue;
            if (!fieldRows[fn]) fieldRows[fn] = [];
            fieldRows[fn].push({
                tableName: dictGR.getValue('name') || '',
                columnLabel: dictGR.getValue('column_label') || '',
                internalType: dictGR.getValue('internal_type') || '',
                maxLength: parseInt(dictGR.getValue('max_length') || '0', 10),
                mandatory: dictGR.getValue('mandatory') === 'true',
                overrideMandatory: dictGR.getValue('override_mandatory') === 'true',
                readOnly: dictGR.getValue('read_only') === 'true',
                overrideReadOnly: dictGR.getValue('override_read_only') === 'true',
                choice: parseInt(dictGR.getValue('choice') || '0', 10),
                reference: dictGR.getValue('reference') || '',
                useReferenceQualifier: dictGR.getValue('use_reference_qualifier') || '',
                referenceQual: dictGR.getValue('reference_qual') || '',
                dynamicRefQual: dictGR.getValue('dynamic_ref_qual') || '',
                overrideReferenceQualifier: dictGR.getValue('override_reference_qualifier') === 'true',
                dependentOnField: dictGR.getValue('dependent_on_field') || '',
            });
        }

        // Sort rows most-specific-first for a field.
        function sortRows(rows: any[]): any[] {
            return rows.slice().sort(function(a: any, b: any) {
                var ai = tableList.indexOf(a.tableName);
                var bi = tableList.indexOf(b.tableName);
                return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
            });
        }

        // Walk most-specific-first; first row with the override flag set is authoritative.
        // Fall back to the base (last) row when no row has the override flag.
        function resolveBoolean(sorted: any[], valueField: string, overrideField: string): boolean {
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j][overrideField]) return sorted[j][valueField];
            }
            return sorted[sorted.length - 1][valueField];
        }

        function firstNonEmpty(sorted: any[], field: string): string {
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j][field]) return sorted[j][field];
            }
            return '';
        }

        function firstNonZero(sorted: any[], field: string): number {
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j][field]) return sorted[j][field];
            }
            return 0;
        }

        // Qualifier fields are a group — read all three from the same authoritative row.
        function resolveQualifierRow(sorted: any[]): any {
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].overrideReferenceQualifier) return sorted[j];
            }
            return sorted[sorted.length - 1];
        }

        // 4. Batch sys_choice query.
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

        // Whole-table replacement: keep choices from the most-specific table that has entries.
        function resolveChoices(fName: string): any[] {
            var rows = choiceRows[fName];
            if (!rows || rows.length === 0) return [];
            var chosen: any[] | undefined;
            for (var t = 0; t < tableList.length; t++) {
                var tableChoices = rows.filter(function(r: any) { return r.tableName === tableList[t]; });
                if (tableChoices.length > 0) { chosen = tableChoices; break; }
            }
            if (!chosen) return [];
            chosen.sort(function(a: any, b: any) { return a.sequence - b.sequence; });
            return chosen.map(function(r: any) {
                var entry: any = { value: r.value, label: r.label };
                if (r.dependentValue) entry.dependentValue = r.dependentValue;
                return entry;
            });
        }

        // 5. Build result for each requested field.
        var result: Record<string, any> = {};

        for (var f = 0; f < fields.length; f++) {
            var fName = fields[f];
            var rows = fieldRows[fName];
            if (!rows || rows.length === 0) continue;

            var sorted = sortRows(rows);
            var label: string = firstNonEmpty(sorted, 'columnLabel') || fName;
            var type: string = firstNonEmpty(sorted, 'internalType') || 'string';
            var reference: string = firstNonEmpty(sorted, 'reference');
            var maxLength: number = firstNonZero(sorted, 'maxLength');
            var isChoiceField: boolean = firstNonZero(sorted, 'choice') > 0;
            var mandatory: boolean = resolveBoolean(sorted, 'mandatory', 'overrideMandatory');
            var readOnly: boolean = resolveBoolean(sorted, 'readOnly', 'overrideReadOnly');
            var dependentOnField: string = firstNonEmpty(sorted, 'dependentOnField');

            var value: string = '';
            var displayValue: string = '';
            if (sysId && recordLoaded) {
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

            if (reference) {
                var qr = resolveQualifierRow(sorted);
                var qt: string = qr.useReferenceQualifier;
                if (qt === 'simple' || qt === 'dynamic' || qt === 'advanced') {
                    fieldData.useReferenceQualifier = qt;
                }
                if (qr.referenceQual) fieldData.referenceQual = qr.referenceQual;
                if (qr.dynamicRefQual) fieldData.dynamicRefQual = qr.dynamicRefQual;
            }

            if (dependentOnField) fieldData.dependentOnField = dependentOnField;

            result[fName] = fieldData;
        }

        response.setBody({ result: result });

    } catch (e) {
        response.setBody({ result: null, error: String(e) });
    }
}
