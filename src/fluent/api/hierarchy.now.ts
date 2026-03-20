import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process } from '../../server/api/hierarchy'

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
            script: process,
        },
    ],
})
