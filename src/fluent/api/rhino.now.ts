import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process } from '../../server/api/rhino'

// Scripted REST API — POST /api/x_326171_ssdk_pack/rhino/search
// Resolves the reference_qual or dynamic_ref_qual for a field via GlideScopedEvaluator.
// Returns only the encoded query string — no table searching is performed here.
// The qualifier script is never exposed to the browser.
RestApi({
    $id: Now.ID['rhino-api'],
    name: 'SDK Component Pack — Rhino Qualifier Resolver',
    serviceId: 'rhino',
    consumes: 'application/json',
    routes: [
        {
            $id: Now.ID['rhino-api-post'],
            name: 'Resolve qualifier',
            method: 'POST',
            path: '/search',
            script: process,
        },
    ],
})
