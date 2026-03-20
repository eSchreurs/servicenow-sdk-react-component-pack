import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process } from '../../server/api/rhino'

// Scripted REST API — POST /api/x_326171_ssdk_pack/rhino/search
// Handles qualified reference field search server-side via GlideScopedEvaluator.
// The qualifier expression is never exposed to the browser.
RestApi({
    $id: Now.ID['rhino-api'],
    name: 'SDK Component Pack — Rhino Search',
    service_id: 'rhino',
    consumes: 'application/json',
    routes: [
        {
            $id: Now.ID['rhino-api-post'],
            name: 'Search with qualifier',
            method: 'POST',
            relative_path: '/search',
            script: process,
        },
    ],
})
