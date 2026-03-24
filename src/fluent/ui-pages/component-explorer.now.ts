import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['component-explorer-page'],
    endpoint: 'x_326171_ssdk_pack_component_explorer.do',
    description: 'ServiceNow SDK React Component Pack — Component Explorer',
    category: 'general',
    html: Now.include('../../../dist/static/component-explorer/index.html'),
    direct: true,
})
