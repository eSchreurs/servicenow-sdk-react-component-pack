import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process as getRecordMetadata } from '../../server/api/getRecordMetadata'
import { process as resolveQualifier } from '../../server/api/resolveQualifier'

// Scripted REST API — POST /api/x_326171_ssdk_pack/rhino/metadata
// Returns field metadata + current values for the given record.
//
// Scripted REST API — POST /api/x_326171_ssdk_pack/rhino/qualifier
// Evaluates the reference qualifier for a field, applying unsaved form state.
RestApi({
    $id: Now.ID['rhino-api'],
    name: 'SDK Component Pack — Rhino Qualifier Resolver',
    serviceId: 'rhino',
    consumes: 'application/json',
    routes: [
        {
            $id: Now.ID['rhino-api-metadata'],
            name: 'Get record metadata',
            method: 'POST',
            path: '/metadata',
            script: getRecordMetadata,
        },
        {
            $id: Now.ID['rhino-api-qualifier'],
            name: 'Resolve qualifier',
            method: 'POST',
            path: '/qualifier',
            script: resolveQualifier,
        },
    ],
})
