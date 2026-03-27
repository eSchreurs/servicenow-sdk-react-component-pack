import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'db074f2442b14039a3dbba2c5410722f'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '546da2e4633c476696fb96874db7516c'
                    }
                    'rhino-api': {
                        table: 'sys_ws_definition'
                        id: '3bc2ad0fcbd1442888a84c81defcd692'
                    }
                    'rhino-api-metadata': {
                        table: 'sys_ws_operation'
                        id: '7cc1e2a281d9404db0d468c5392ec84c'
                    }
                    src_server_api_getRecordMetadata_ts: {
                        table: 'sys_module'
                        id: 'db041a70500b460fbef7d6f82952429c'
                    }
                }
                composite: [
                    {
                        table: 'sys_ux_lib_asset'
                        id: '36db859a0f80496eb87cd716678f26e0'
                        key: {
                            name: 'x_326171_ssdk_pack/component-explorer/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '468a57caeea44a9e999b38572d9d8466'
                        key: {
                            endpoint: 'x_326171_ssdk_pack_component_explorer.do'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'bff1bcd9f4144d82b74989fdbf81af13'
                        key: {
                            name: 'x_326171_ssdk_pack/component-explorer/main'
                        }
                    },
                ]
            }
        }
    }
}
