import { GlideRecord, GlideTableHierarchy, gs } from '@servicenow/glide'

// Scripted REST API handler — POST /api/x_326171_ssdk_pack/rhino/metadata
// Returns metadata + current values for all requested fields on the given record.
//
// Returns { result: { [field]: FieldData } } or { result: null, error: string }.
// Requires authentication. Scoped to x_326171_ssdk_pack.

export function process(request: any, response: any): void {
    try {
        var body = request.body.data;
        var table: string = body.table;
        var sysId: string = body.sysId;
        var fields: string[] = body.fields;
        var language: string = body.language || 'en';

        if (!table || !fields || fields.length === 0) {
            response.setBody({ result: null, error: 'table and fields are required' });
            return;
        }

        // Build table hierarchy most-specific-first.
        var hierarchy = new GlideTableHierarchy(table);
        var tables = hierarchy.getTables();
        var tableList: string[] = [];
        for (var i = 0; i < tables.length; i++) {
            tableList.push(tables[i].toString());
        }
        if (tableList.length > 0 && tableList[0] !== table) {
            tableList.reverse();
        }

        // Step 1 — Base field definitions from sys_dictionary.
        // One row per field: the row from the most-specific table (earliest index in tableList).
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addQuery('name', 'IN', tableList.join(','));
        dictGR.addQuery('element', 'IN', fields.join(','));
        dictGR.query();

        var baseRows: Record<string, any> = {};
        while (dictGR.next()) {
            var fn: string = dictGR.getValue('element') || '';
            if (!fn) continue;
            var tn: string = dictGR.getValue('name') || '';
            var existing = baseRows[fn];
            if (!existing || tableList.indexOf(tn) < tableList.indexOf(existing.tableName)) {
                baseRows[fn] = {
                    tableName: tn,
                    label: dictGR.getValue('column_label') || '',
                    type: dictGR.getValue('internal_type') || 'string',
                    maxLength: parseInt(dictGR.getValue('max_length') || '0', 10),
                    mandatory: dictGR.getValue('mandatory') === '1',
                    readOnly: dictGR.getValue('read_only') === '1',
                    choice: parseInt(dictGR.getValue('choice') || '0', 10),
                    reference: dictGR.getValue('reference') || '',
                    useReferenceQualifier: dictGR.getValue('use_reference_qualifier') || '',
                    referenceQual: dictGR.getValue('reference_qual') || '',
                    referenceQualCondition: dictGR.getValue('reference_qual_condition') || '',
                    dynamicRefQual: dictGR.getValue('dynamic_ref_qual') || '',
                    dependentOnField: dictGR.getValue('dependent_on_field') || '',
                };
            }
        }

        // Step 2 — Apply dictionary overrides from sys_dictionary_override.
        // Patch the base row in place for each active override flag.
        var overrideGR = new GlideRecord('sys_dictionary_override');
        overrideGR.addQuery('name', 'IN', tableList.join(','));
        overrideGR.addQuery('element', 'IN', fields.join(','));
        overrideGR.query();

        while (overrideGR.next()) {
            var ofn: string = overrideGR.getValue('element') || '';
            if (!ofn || !baseRows[ofn]) continue;
            var row = baseRows[ofn];
            if (overrideGR.getValue('mandatory_override') === '1') row.mandatory = overrideGR.getValue('mandatory') === '1';
            if (overrideGR.getValue('read_only_override') === '1') row.readOnly = overrideGR.getValue('read_only') === '1';
            if (overrideGR.getValue('reference_qual_override') === '1') {
                row.useReferenceQualifier = overrideGR.getValue('reference_qual_override') || '';
                row.referenceQual = overrideGR.getValue('reference_qual') || '';
            }
            if (overrideGR.getValue('dependent_override') === '1') row.dependentOnField = overrideGR.getValue('dependent_on_field') || '';
        }

        // Step 3 — Choices from sys_choice.
        // Only query for fields that are choice fields. Whole-table replacement: use entries
        // from the most-specific table in the hierarchy that has any entries for the field.
        var choiceFields: string[] = [];
        for (var f = 0; f < fields.length; f++) {
            if (baseRows[fields[f]] && baseRows[fields[f]].choice > 0) choiceFields.push(fields[f]);
        }

        var choiceRows: Record<string, any[]> = {};
        if (choiceFields.length > 0) {
            var choiceGR = new GlideRecord('sys_choice');
            choiceGR.addQuery('name', 'IN', tableList.join(','));
            choiceGR.addQuery('element', 'IN', choiceFields.join(','));
            choiceGR.addQuery('language', language);
            choiceGR.query();

            while (choiceGR.next()) {
                var cfn: string = choiceGR.getValue('element') || '';
                var cfTable: string = choiceGR.getValue('name') || '';
                if (!cfn || !cfTable) continue;
                if (!choiceRows[cfn]) choiceRows[cfn] = [];
                choiceRows[cfn].push({
                    tableName: cfTable,
                    value: choiceGR.getValue('value') || '',
                    label: choiceGR.getValue('label') || '',
                    dependentValue: choiceGR.getValue('dependent_value') || '',
                    sequence: parseInt(choiceGR.getValue('sequence') || '0', 10),
                });
            }
        }

        // Step 4 — Record values.
        var gr = new GlideRecord(table);
        var recordLoaded = sysId ? gr.get('sys_id', sysId) : false;

        // Build result.
        var result: Record<string, any> = {};

        for (var f = 0; f < fields.length; f++) {
            var fName = fields[f];
            var row = baseRows[fName];

            if (!row) {
                gs.info('row not found! ' + fName);
                result[fName] = {
                    name: fName, label: fName, mandatory: false, readOnly: false,
                    maxLength: 0, type: 'string', isChoiceField: false, choices: [],
                    reference: null, useReferenceQualifier: null, referenceQual: null,
                    dynamicRefQual: null, dependentOnField: null, value: '', displayValue: '',
                };
                continue;
            }

            // Choices: whole-table replacement from most-specific table that has entries.
            var choices: any[] = [];
            if (row.choice > 0 && choiceRows[fName]) {
                for (var t = 0; t < tableList.length; t++) {
                    var tableChoices = choiceRows[fName].filter(function(c: any) { return c.tableName === tableList[t]; });
                    if (tableChoices.length > 0) {
                        tableChoices.sort(function(a: any, b: any) { return a.sequence - b.sequence; });
                        choices = tableChoices.map(function(c: any) {
                            var entry: any = { value: c.value, label: c.label };
                            if (c.dependentValue) entry.dependentValue = c.dependentValue;
                            return entry;
                        });
                        break;
                    }
                }
            }

            var value = '';
            var displayValue = '';
            if (recordLoaded) {
                value = gr.getValue(fName) || '';
                displayValue = gr.getDisplayValue(fName) || value;
            }

            var qt = row.useReferenceQualifier;
            gs.info('qt: ' + qt + ' ' + fName);
            result[fName] = {
                name: fName,
                label: row.label || fName,
                mandatory: row.mandatory,
                readOnly: row.readOnly,
                maxLength: row.maxLength,
                type: row.type || 'string',
                isChoiceField: row.choice > 0,
                choices: choices,
                reference: row.reference || null,
                useReferenceQualifier: row.reference ? ((qt === 'simple' || qt === 'dynamic' || qt === 'advanced') ? qt : null) : null,
                referenceQual: row.reference ? (row.referenceQual || null) : null,
                dynamicRefQual: row.reference ? (row.dynamicRefQual || null) : null,
                dependentOnField: row.dependentOnField || null,
                value: value,
                displayValue: displayValue,
            };
        }

        response.setBody({ result: result });

    } catch (e) {
        response.setBody({ result: null, error: String(e) });
    }
}
