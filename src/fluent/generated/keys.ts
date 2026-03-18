import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '2406007b4e7b45b4947e4b885e67e34b'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'cdd0b067a58a4201b72945c2fde4307b'
                    }
                }
                composite: [
                    {
                        table: 'sys_ui_page'
                        id: '04cf66f2a021490dab597905db7cdea0'
                        key: {
                            endpoint: 'x_326171_ssdk_pack_hello_user.do'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '7e20b61eb51340ad8f4b934cca3eb445'
                        key: {
                            name: 'x_326171_ssdk_pack/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'bdac45c618174f5aa7b4f7aae2950132'
                        key: {
                            name: 'x_326171_ssdk_pack/main'
                        }
                    },
                ]
            }
        }
    }
}
