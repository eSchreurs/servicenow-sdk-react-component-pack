import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process as getRecordMetadata } from '../../server/api/getRecordMetadata'

// Scripted REST API — POST /api/x_326171_ssdk_pack/rhino/metadata
// Returns field metadata + current values for the given record.

RestApi({
    $id: Now.ID['rhino-api'],
    name: 'SDK Component Pack — Rhino Utilities',
    serviceId: 'rhino',
    consumes: 'application/json',
    routes: [
        {
            $id: Now.ID['rhino-api-metadata'],
            name: 'Get record metadata',
            method: 'POST',
            path: '/metadata',
            script: getRecordMetadata,
            consumes: 'application/json',
            produces: 'application/json,application/xml,text/xml',
        }
    ]
})
