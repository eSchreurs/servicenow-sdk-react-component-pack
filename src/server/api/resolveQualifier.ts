import { GlideRecord, GlideTableHierarchy, GlideScopedEvaluator } from '@servicenow/glide'

// Scripted REST API handler — POST /api/x_326171_ssdk_pack/rhino/qualifier
// Evaluates the reference qualifier for `field` on `table`, taking the caller's
// currentValues (unsaved form state) into account via gr.setValue().
// Returns { result: encodedQueryString } — empty string means no qualifier.
// The qualifier script is never exposed to the browser.
// Returns { result: "" } on any failure.
// Requires authentication. Scoped to x_326171_ssdk_pack.

export function process(request: any, response: any): void {
    try {
        var body = request.body.data;
        var table: string = body.table;
        var sysId: string = body.sysId;
        var field: string = body.field;
        var currentValues: Record<string, string> = body.currentValues || {};

        // 1. Load GlideRecord; apply unsaved form values so the qualifier evaluates
        //    correctly against the current state of the in-progress record.
        var gr = new GlideRecord(table);
        if (sysId) {
            gr.get('sys_id', sysId);
        }
        var keys = Object.keys(currentValues);
        for (var k = 0; k < keys.length; k++) {
            (gr as any).setValue(keys[k], currentValues[keys[k]]);
        }

        // 2. Build full table hierarchy (most-specific-first) for sys_dictionary query.
        var hierarchy = new GlideTableHierarchy(table);
        var tables = hierarchy.getTables();
        var tableList: string[] = [];
        for (var i = 0; i < tables.length; i++) {
            tableList.push(tables[i].toString());
        }
        if (tableList.length > 0 && tableList[0] !== table) {
            tableList.reverse();
        }

        // 3. Query sys_dictionary for the authoritative qualifier row (override-aware).
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addQuery('name', 'IN', tableList.join(','));
        dictGR.addQuery('element', field);
        dictGR.query();

        var rows: any[] = [];
        while (dictGR.next()) {
            rows.push({
                tableName: dictGR.getValue('name') || '',
                referenceQual: dictGR.getValue('reference_qual') || '',
                dynamicRefQual: dictGR.getValue('dynamic_ref_qual') || '',
                overrideReferenceQualifier: parseBool(dictGR.getValue('override_reference_qualifier')),
                sysId: dictGR.getValue('sys_id') || '',
            });
        }

        if (rows.length === 0) {
            response.setBody({ result: '' });
            return;
        }

        // Sort most-specific-first.
        rows.sort(function(a: any, b: any) {
            var ai = tableList.indexOf(a.tableName);
            var bi = tableList.indexOf(b.tableName);
            return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
        });

        // Select authoritative row: first with override flag set, else base (last).
        var authRow: any = rows[rows.length - 1];
        for (var j = 0; j < rows.length; j++) {
            if (rows[j].overrideReferenceQualifier) {
                authRow = rows[j];
                break;
            }
        }

        // 4. Resolve qualifier — no type detection needed.
        //    dynamicRefQual present → evaluate dynamic filter option via GlideScopedEvaluator
        //    referenceQual starts with 'javascript:' → evaluate via GlideScopedEvaluator
        //    anything else → plain encoded query, return as-is
        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable('current', gr);

        if (authRow.dynamicRefQual) {
            var dynGR = new GlideRecord('sys_filter_option_dynamic');
            if (dynGR.get('sys_id', authRow.dynamicRefQual)) {
                response.setBody({ result: evaluator.evaluateScript(dynGR, 'filter_script') || '' });
            } else {
                response.setBody({ result: '' });
            }
            return;
        }

        if (authRow.referenceQual.indexOf('javascript:') === 0) {
            var advGR = new GlideRecord('sys_dictionary');
            if (advGR.get('sys_id', authRow.sysId)) {
                response.setBody({ result: evaluator.evaluateScript(advGR, 'reference_qual') || '' });
            } else {
                response.setBody({ result: '' });
            }
            return;
        }

        // Plain encoded query — return directly.
        response.setBody({ result: authRow.referenceQual || '' });

    } catch (e) {
        response.setBody({ result: '' });
    }
}

function parseBool(val: string): boolean {
    return val === 'true' || val === '1';
}