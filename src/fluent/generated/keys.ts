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
                    'component-pack-page': {
                        table: 'sys_ui_page'
                        id: 'a8b5c8ceb5d0417eb17ef7fdcfc6057f'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'cdd0b067a58a4201b72945c2fde4307b'
                    }
                    'x_326171_ssdk_pack/main': {
                        table: 'sys_ux_lib_asset'
                        id: '9cc011c2057543328cd740d9dda24c85'
                    }
                    'x_326171_ssdk_pack/main.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: '3f214000d9bb4aa48898b427bc2e58f6'
                    }
                    'rhino-api': {
                        table: 'sys_ws_definition'
                        id: '2dd212aa38b54eb2aaba8280c1aef0a0'
                    }
                    'rhino-api-metadata': {
                        table: 'sys_ws_operation'
                        id: 'a1b2c3d4e5f64a5b8c9d0e1f2a3b4c5d'
                    }
                    'rhino-api-qualifier': {
                        table: 'sys_ws_operation'
                        id: 'f9e8d7c6b5a44b3c2d1e0f9e8d7c6b5a'
                    }
                }
                composite: [
                    {
                        table: 'sys_ui_page'
                        id: '04cf66f2a021490dab597905db7cdea0'
                        deleted: true
                        key: {
                            endpoint: 'x_326171_ssdk_pack_hello_user.do'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '7e20b61eb51340ad8f4b934cca3eb445'
                        deleted: true
                        key: {
                            name: 'x_326171_ssdk_pack/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'bdac45c618174f5aa7b4f7aae2950132'
                        deleted: true
                        key: {
                            name: 'x_326171_ssdk_pack/main'
                        }
                    },
                    {
                        table: 'sys_ws_definition'
                        id: 'ecdbd66a26a24556b58209e5bc4deffe'
                        deleted: true
                        key: {
                            serviceId: 'hierarchy'
                        }
                    },
                    {
                        table: 'sys_ws_operation'
                        id: '66bc4306c39442c19fb3cf1ed8cd18ff'
                        deleted: true
                        key: {
                            name: 'Get table hierarchy'
                        }
                    },
                    {
                        table: 'sys_ws_operation'
                        id: '8f235bee41b74e209c0227614cd9eefe'
                        deleted: true
                        key: {
                            name: 'Resolve qualifier'
                        }
                    },
                ]
            }
        }
    }
}
