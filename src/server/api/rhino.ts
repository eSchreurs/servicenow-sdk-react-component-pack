import { GlideRecord, GlideScopedEvaluator } from '@servicenow/glide'

// Scripted REST API handler — POST /api/x_326171_ssdk_pack/rhino/search
// Resolves the reference_qual or dynamic_ref_qual for the given field via
// GlideScopedEvaluator. Returns only the encoded query string — no searching.
// The qualifier is never exposed to the browser as a raw script; only the
// resolved encoded query is returned.
// Returns { result: "" } (empty string = no qualifier) on any failure.
// Requires authentication. Scoped to x_326171_ssdk_pack.

export function process(request: any, response: any): void {
    try {
        var body = request.body.data;
        var table = body.table;
        var sysId = body.sysId;
        var field = body.field;

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
            response.setBody({ result: '' });
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
            if (dynGR.get('sys_id', dictGR.getValue('dynamic_ref_qual'))) {
                qualifier = evaluator.evaluateScript(dynGR, 'filter_script') || '';
            }
        }

        response.setBody({ result: qualifier });

    } catch (e) {
        // Never surface errors — return empty qualifier so the reference field
        // falls back to an unfiltered search.
        response.setBody({ result: '' });
    }
}
