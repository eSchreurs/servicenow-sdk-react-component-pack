import { GlideRecord, GlideScopedEvaluator } from '@servicenow/glide'

// Scripted REST API handler — POST /api/x_326171_ssdk_pack/rhino/search
// Handles the entire qualified reference field search server-side:
// evaluates the reference_qual or dynamic_ref_qual via GlideScopedEvaluator,
// builds the search query, queries the reference table, and returns result rows.
// The qualifier expression is never exposed to the browser.
// Returns { result: [] } on any failure — never throws an HTTP error.
// Requires authentication. Scoped to x_326171_ssdk_pack.

export function process(request: any, response: any): void {
    try {
        var body = request.body.data;
        var table = body.table;
        var sysId = body.sysId;
        var field = body.field;
        var searchTerm = body.searchTerm || '';
        var searchFields = Array.isArray(body.searchFields) ? body.searchFields : [];
        var limit = body.limit || 15;

        // 1. Load current record — provides GlideRecord context for qualifier evaluation.
        //    For new records (sysId is empty string), current is an empty GlideRecord —
        //    all current.field references in the qualifier return empty values.
        var current = new GlideRecord(table);
        if (sysId) {
            current.get(sysId);
        }

        // 2. Read qualifier configuration from sys_dictionary.
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addQuery('name', table);
        dictGR.addQuery('element', field);
        dictGR.query();

        if (!dictGR.next()) {
            response.setBody({ result: [] });
            return;
        }

        var referenceTable = dictGR.getValue('reference');
        if (!referenceTable) {
            response.setBody({ result: [] });
            return;
        }

        var qualType = dictGR.getValue('use_reference_qualifier');

        // 3. Evaluate qualifier using GlideScopedEvaluator against the actual GlideRecord
        //    field — no raw string passing, no eval(), no temporary records.
        var qualifier = '';
        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable('current', current);

        if (qualType === 'advanced') {
            // reference_qual is a field on sys_dictionary — GlideScopedEvaluator reads
            // it directly, so no javascript: prefix stripping is needed here.
            qualifier = evaluator.evaluateScript(dictGR, 'reference_qual') || '';
        } else if (qualType === 'dynamic') {
            var dynGR = new GlideRecord('sys_filter_option_dynamic');
            if (dynGR.get(dictGR.getValue('dynamic_ref_qual'))) {
                qualifier = evaluator.evaluateScript(dynGR, 'filter_script') || '';
            }
        }

        // 4. Resolve the display field of the reference table.
        //    Query sys_dictionary for display=true on the reference table to get the
        //    actual field name (e.g. 'name', 'number'). getDisplayValue('reference')
        //    returns the table label ('User'), not the field name — cannot be used here.
        var displayField = 'name'; // safe fallback
        var dispDict = new GlideRecord('sys_dictionary');
        dispDict.addQuery('name', referenceTable);
        dispDict.addQuery('display', 'true');
        dispDict.query();
        if (dispDict.next()) {
            displayField = dispDict.getValue('element') || 'name';
        }

        // 5. Build OR-combined CONTAINS search query.
        //    Display value field of the reference table is always included first.
        var searchParts = [displayField + 'CONTAINS' + searchTerm];
        for (var i = 0; i < searchFields.length; i++) {
            if (searchFields[i] !== displayField) {
                searchParts.push(searchFields[i] + 'CONTAINS' + searchTerm);
            }
        }
        var searchQuery = searchParts.join('^OR');

        // 6. AND the resolved qualifier onto the search conditions.
        if (qualifier) {
            searchQuery = '(' + searchQuery + ')^' + qualifier;
        }

        // 7. Query the reference table and build results.
        var gr = new GlideRecord(referenceTable);
        gr.addEncodedQuery(searchQuery);
        gr.setLimit(limit);
        gr.query();

        var results: Array<{ sysId: string; displayValue: string; columns: Array<{ field: string; value: string }> }> = [];
        while (gr.next()) {
            var columns = [{ field: displayField, value: gr.getDisplayValue(displayField) }];
            for (var j = 0; j < searchFields.length; j++) {
                if (searchFields[j] !== displayField) {
                    columns.push({ field: searchFields[j], value: gr.getDisplayValue(searchFields[j]) });
                }
            }
            results.push({
                sysId: gr.getUniqueValue(),
                displayValue: gr.getDisplayValue(),
                columns: columns,
            });
        }

        response.setBody({ result: results });

    } catch (e) {
        // Never surface errors — return empty results so the reference field shows
        // "No results found" rather than blocking the user.
        response.setBody({ result: [] });
    }
}
