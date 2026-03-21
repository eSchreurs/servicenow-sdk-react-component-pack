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
                    src_server_api_getRecordMetadata_ts: {
                        table: 'sys_module'
                        id: '8044015cf0244610aed65a562a078dca'
                    }
                    src_server_api_resolveQualifier_ts: {
                        table: 'sys_module'
                        id: '65eda97d4dce433d961eab8e8c7b527a'
                    }
                    'x_326171_ssdk_pack/main': {
                        table: 'sys_ux_lib_asset'
                        id: '9cc011c2057543328cd740d9dda24c85'
                        deleted: true
                    }
                    'x_326171_ssdk_pack/main.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: '3f214000d9bb4aa48898b427bc2e58f6'
                        deleted: true
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
                        id: '274859a0963345149de882665a0e762f'
                        key: {
                            name: 'x_326171_ssdk_pack/component-explorer/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '65fd5f53d3c0490b82bf9aaf12dda8e8'
                        key: {
                            name: 'x_326171_ssdk_pack/client'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '664a5f8554964a7db12e2e1d4958b357'
                        key: {
                            name: 'x_326171_ssdk_pack/client.js.map'
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
                        table: 'sys_ux_lib_asset'
                        id: '7e20b61eb51340ad8f4b934cca3eb445'
                        deleted: false
                        key: {
                            name: 'x_326171_ssdk_pack/main.js.map'
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
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'a85f76957ce842d29f09efc9e5df824f'
                        key: {
                            name: 'x_326171_ssdk_pack/component-explorer/main'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: 'a8b5c8ceb5d0417eb17ef7fdcfc6057f'
                        key: {
                            endpoint: 'x_326171_ssdk_pack_component_pack.do'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'bdac45c618174f5aa7b4f7aae2950132'
                        deleted: false
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
                ]
            }
        }
    }
}
