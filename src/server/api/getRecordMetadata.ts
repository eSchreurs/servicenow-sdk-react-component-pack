import { GlideRecord, GlideTableHierarchy } from '@servicenow/glide'
 
export function process(request: any, response: any): void {
    try {
        var body = request.body.data;
        var table: string = body.table;
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
 
        function parseBool(val: string): boolean {
            return val === 'true' || val === '1';
        }
 
        // Step 1 — Base field definitions from sys_dictionary.
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
 
                var useRefQual = dictGR.getValue('use_reference_qualifier') || '';
                var referenceQual = '';
                if (useRefQual === 'simple') {
                    referenceQual = dictGR.getValue('reference_qual_condition') || '';
                } else if (useRefQual === 'dynamic') {
                    var dynSysId = dictGR.getValue('dynamic_ref_qual') || '';
                    referenceQual = dynSysId ? fn + 'DYNAMIC' + dynSysId : '';
                } else if (useRefQual === 'advanced') {
                    referenceQual = dictGR.getValue('reference_qual') || '';
                }
 
                baseRows[fn] = {
                    tableName: tn,
                    label: dictGR.getValue('column_label') || '',
                    type: dictGR.getValue('internal_type') || 'string',
                    maxLength: parseInt(dictGR.getValue('max_length') || '0', 10),
                    mandatory: parseBool(dictGR.getValue('mandatory')),
                    readOnly: parseBool(dictGR.getValue('read_only')),
                    choice: parseInt(dictGR.getValue('choice') || '0', 10),
                    reference: dictGR.getValue('reference') || '',
                    referenceQual: referenceQual,
                    dependentOnField: dictGR.getValue('dependent_on_field') || '',
                };
            }
        }
 
        // Step 2 — Apply dictionary overrides.
        var overrideGR = new GlideRecord('sys_dictionary_override');
        overrideGR.addQuery('name', 'IN', tableList.join(','));
        overrideGR.addQuery('element', 'IN', fields.join(','));
        overrideGR.query();
 
        // Track the most-specific table whose override has been applied per field.
        var overrideApplied: Record<string, string> = {};

        while (overrideGR.next()) {
            var ofn: string = overrideGR.getValue('element') || '';
            if (!ofn || !baseRows[ofn]) continue;
            var otn: string = overrideGR.getValue('name') || '';
            var prevTable = overrideApplied[ofn];
            if (prevTable && tableList.indexOf(otn) >= tableList.indexOf(prevTable)) continue;
            overrideApplied[ofn] = otn;
            var row = baseRows[ofn];
            if (parseBool(overrideGR.getValue('mandatory_override'))) {
                row.mandatory = parseBool(overrideGR.getValue('mandatory'));
            }
            if (parseBool(overrideGR.getValue('read_only_override'))) {
                row.readOnly = parseBool(overrideGR.getValue('read_only'));
            }
            if (parseBool(overrideGR.getValue('reference_qual_override'))) {
                row.referenceQual = overrideGR.getValue('reference_qual') || '';
            }
            if (parseBool(overrideGR.getValue('dependent_override'))) {
                row.dependentOnField = overrideGR.getValue('dependent_on_field') || '';
            }
        }
 
        // Step 3 — Choices from sys_choice (choice fields only).
        var choiceFields: string[] = [];
        for (var f = 0; f < fields.length; f++) {
            if (baseRows[fields[f]] && baseRows[fields[f]].choice > 0) {
                choiceFields.push(fields[f]);
            }
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
 
        // Build result.
        var result: Record<string, any> = {};
 
        for (var f = 0; f < fields.length; f++) {
            var fName = fields[f];
            var row = baseRows[fName];
 
            if (!row) {
                result[fName] = {
                    name: fName,
                    label: fName,
                    mandatory: false,
                    readOnly: false,
                    maxLength: 0,
                    type: 'string',
                    isChoiceField: false,
                    choices: [],
                    reference: null,
                    referenceQual: null,
                    dependentOnField: null,
                };
                continue;
            }
 
            var choices: any[] = [];
            if (row.choice > 0 && choiceRows[fName]) {
                for (var t = 0; t < tableList.length; t++) {
                    var tableChoices = choiceRows[fName].filter(
                        function(c: any) { return c.tableName === tableList[t]; }
                    );
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
                referenceQual: row.referenceQual || null,
                dependentOnField: row.dependentOnField || null,
            };
        }
 
        response.setBody({ result: result });
 
    } catch (e) {
        response.setBody({ result: null, error: String(e) });
    }
}