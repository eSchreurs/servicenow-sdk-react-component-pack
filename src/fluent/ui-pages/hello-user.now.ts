import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['hello-user-page'],
    endpoint: 'x_326171_ssdk_pack_hello_user.do',
    description: 'Hello User - Simple TypeScript/React boilerplate',
    category: 'general',
    html: Now.include('../../client/index.html'),
    direct: true,
})