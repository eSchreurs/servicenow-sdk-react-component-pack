import { GlideTableHierarchy } from '@servicenow/glide'

// Scripted REST API handler — GET /api/x_326171_ssdk_pack/hierarchy/{table}
// Returns the full table hierarchy for the given table, ordered most-specific-first.
// Requires authentication. Scoped to x_326171_ssdk_pack.

export function process(request: any, response: any): void {
    var table = request.pathParams.table;

    var hierarchy = new GlideTableHierarchy(table);
    var tables = hierarchy.getTables();

    var result: string[] = [];
    for (var i = 0; i < tables.length; i++) {
        result.push(tables[i].toString());
    }

    // Ensure most-specific-first: the queried table should be the first element.
    // GlideTableHierarchy.getTables() order may vary — normalise defensively.
    if (result.length > 0 && result[0] !== table) {
        result.reverse();
    }

    response.setBody({ result: result });
}
