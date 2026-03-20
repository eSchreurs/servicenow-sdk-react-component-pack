import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'

// Scripted REST API — GET /api/x_326171_ssdk_pack/hierarchy/{table}
// Returns the full table hierarchy for the given table, ordered most-specific-first.
RestApi({
    $id: Now.ID['hierarchy-api'],
    name: 'SDK Component Pack — Hierarchy',
    serviceId: 'hierarchy',
    consumes: 'application/json',
    routes: [
        {
            $id: Now.ID['hierarchy-api-get'],
            name: 'Get table hierarchy',
            method: 'GET',
            path: '/{table}',
            script: /* server */ (request, response) => {
                var table = request.pathParams.table;

                var hierarchy = new GlideTableHierarchy(table);
                var tables = hierarchy.getTables();

                var result = [];
                for (var i = 0; i < tables.size(); i++) {
                    result.push(tables.get(i).toString());
                }

                // Ensure most-specific-first: the queried table should be the first element.
                // GlideTableHierarchy.getTables() order may vary — normalise defensively.
                if (result.length > 0 && result[0] !== table) {
                    result.reverse();
                }

                response.setBody({ result: result });
            },
        },
    ],
})
