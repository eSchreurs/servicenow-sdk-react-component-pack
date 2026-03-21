import { GlideRecord, GlideTableHierarchy, gs } from '@servicenow/glide'

// Scripted REST API handler — POST /api/x_326171_ssdk_pack/rhino/metadata
// Returns metadata + current values for all requested fields on the given record.
//
// Metadata is resolved from sys_dictionary using the full table hierarchy so that
// dictionary overrides (mandatory_override, read_only_override,
// reference_qual_override, dependent_override) are applied correctly.
// Choice lists are resolved from sys_choice (whole-table replacement semantics).
// Language is read from the active session via gs.getSession().getLanguage().
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
                overrideMandatory: dictGR.getValue('mandatory_override') === 'true',
                readOnly: dictGR.getValue('read_only') === 'true',
                overrideReadOnly: dictGR.getValue('read_only_override') === 'true',
                choice: parseInt(dictGR.getValue('choice') || '0', 10),
                reference: dictGR.getValue('reference') || '',
                useReferenceQualifier: dictGR.getValue('use_reference_qualifier') || '',
                referenceQual: dictGR.getValue('reference_qual') || '',
                dynamicRefQual: dictGR.getValue('dynamic_ref_qual') || '',
                overrideReferenceQualifier: dictGR.getValue('reference_qual_override') === 'true',
                dependentOnField: dictGR.getValue('dependent_on_field') || '',
                overrideDependentField: dictGR.getValue('dependent_override') === 'true',
            });
        }

        // Sort rows most-specific-first based on position in the table hierarchy.
        function sortRows(rows: any[]): any[] {
            return rows.slice().sort(function(a: any, b: any) {
                var ai = tableList.indexOf(a.tableName);
                var bi = tableList.indexOf(b.tableName);
                return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
            });
        }

        // 4. Batch sys_choice query — language from the active session.
        var language: string = gs.getSession().getLanguage().toString() || 'en';
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

            // Field not found in dictionary — include with safe defaults rather than skipping.
            if (!rows || rows.length === 0) {
                result[fName] = {
                    name: fName, label: fName, mandatory: false, readOnly: false,
                    maxLength: 0, type: 'string', isChoiceField: false, choices: [],
                    reference: null, useReferenceQualifier: null, referenceQual: null,
                    dynamicRefQual: null, dependentOnField: null, value: '', displayValue: '',
                };
                continue;
            }

            var sorted = sortRows(rows);
            var base = sorted[sorted.length - 1];

            // label — no override flag: first non-empty, most-specific-first
            var label = fName;
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].columnLabel) { label = sorted[j].columnLabel; break; }
            }

            // type — no override flag: first non-empty, most-specific-first
            var type = 'string';
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].internalType) { type = sorted[j].internalType; break; }
            }

            // reference — no override flag: first non-empty, most-specific-first
            var reference = '';
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].reference) { reference = sorted[j].reference; break; }
            }

            // maxLength — no override flag: first non-zero, most-specific-first
            var maxLength = 0;
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].maxLength) { maxLength = sorted[j].maxLength; break; }
            }

            // choice — no override flag: first non-zero, most-specific-first
            var choiceValue = 0;
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].choice) { choiceValue = sorted[j].choice; break; }
            }

            // mandatory — override_mandatory flag: first matching row wins, else base row
            var mandatory = base.mandatory;
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].overrideMandatory) { mandatory = sorted[j].mandatory; break; }
            }

            // readOnly — override_read_only flag: first matching row wins, else base row
            var readOnly = base.readOnly;
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].overrideReadOnly) { readOnly = sorted[j].readOnly; break; }
            }

            // dependentOnField — override_dependent_field flag: first matching row wins, else base row
            var dependentOnField: string | null = base.dependentOnField || null;
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].overrideDependentField) { dependentOnField = sorted[j].dependentOnField || null; break; }
            }

            // qualifier fields — resolved as a group from one authoritative row:
            // override_reference_qualifier flag wins, else base row
            var qualRow = base;
            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].overrideReferenceQualifier) { qualRow = sorted[j]; break; }
            }
            var qt = qualRow.useReferenceQualifier;
            var useReferenceQualifier: string | null = (qt === 'simple' || qt === 'dynamic' || qt === 'advanced') ? qt : null;
            var referenceQual: string | null = qualRow.referenceQual || null;
            var dynamicRefQual: string | null = qualRow.dynamicRefQual || null;

            // Record values — only populated when a real record was loaded.
            var value = '';
            var displayValue = '';
            if (sysId && recordLoaded) {
                value = gr.getValue(fName) || '';
                displayValue = gr.getDisplayValue(fName) || value;
            }

            result[fName] = {
                name: fName,
                label: label,
                mandatory: mandatory,
                readOnly: readOnly,
                maxLength: maxLength,
                type: type,
                isChoiceField: choiceValue > 0,
                choices: choiceValue > 0 ? resolveChoices(fName) : [],
                reference: reference || null,
                useReferenceQualifier: reference ? useReferenceQualifier : null,
                referenceQual: reference ? referenceQual : null,
                dynamicRefQual: reference ? dynamicRefQual : null,
                dependentOnField: dependentOnField,
                value: value,
                displayValue: displayValue,
            };
        }

        response.setBody({ result: result });

    } catch (e) {
        response.setBody({ result: null, error: String(e) });
    }
}
