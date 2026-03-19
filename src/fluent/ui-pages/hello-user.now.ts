import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['hello-user-page'],
    endpoint: 'x_326171_ssdk_pack_hello_user.do',
    description: 'ServiceNow SDK React Component Pack',
    category: 'general',
    html: Now.include('../../../dist/static/index.html'),
    direct: true,
})