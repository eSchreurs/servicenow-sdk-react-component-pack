// Scripted REST API — POST /api/x_est_react_pack/rhino/resolve
// Evaluates the reference_qual or dynamic_ref_qual for the given field using
// GlideScopedEvaluator and returns the resolved encoded query string.
// Handles both 'advanced' and 'dynamic' qualifier types.
// Returns { result: "" } on any failure — never throws an HTTP error.
// Requires authentication. Scoped to x_est_react_pack.
(function process(request, response) {
    try {
        var body = request.body.data;
        var table = body.table;
        var sysId = body.sysId;
        var field = body.field;

        // Load the record to use as the 'current' context for qualifier evaluation.
        // For new records (sysId is empty string), current is an empty GlideRecord —
        // all current.field references in the qualifier return empty values.
        var current = new GlideRecord(table);
        if (sysId) {
            current.get(sysId);
        }

        // Read the qualifier configuration from sys_dictionary.
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addQuery('name', table);
        dictGR.addQuery('element', field);
        dictGR.query();

        if (!dictGR.next()) {
            response.setBody({ result: '' });
            return;
        }

        var qualType = dictGR.getValue('use_reference_qualifier');
        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable('current', current);

        var qualifier = '';

        if (qualType === 'advanced') {
            // reference_qual holds the javascript: expression.
            // GlideScopedEvaluator.evaluateScript reads directly from the GlideRecord field —
            // no raw string passing. Strip the 'javascript:' prefix if present.
            qualifier = evaluator.evaluateScript(dictGR, 'reference_qual') || '';

        } else if (qualType === 'dynamic') {
            // dynamic_ref_qual holds the sys_id of the sys_filter_option_dynamic record.
            // That record's filter_script field contains the script to evaluate.
            var dynGR = new GlideRecord('sys_filter_option_dynamic');
            if (dynGR.get(dictGR.getValue('dynamic_ref_qual'))) {
                qualifier = evaluator.evaluateScript(dynGR, 'filter_script') || '';
            }
        }

        response.setBody({ result: qualifier });

    } catch (e) {
        // Never surface errors to the caller — return empty string so the reference
        // field falls back to an unfiltered search rather than blocking the user.
        response.setBody({ result: '' });
    }
})(request, response);
