import React, { createContext, useContext, ReactNode } from 'react';

export interface ServiceNowConfig {
  language: string;
}

const defaultConfig: ServiceNowConfig = {
  language: 'en',
};

export const ServiceNowContext = createContext<ServiceNowConfig>(defaultConfig);

interface ServiceNowProviderProps {
  config?: Partial<ServiceNowConfig>;
  children: ReactNode;
}

export function ServiceNowProvider({ config, children }: ServiceNowProviderProps): React.ReactElement {
  const mergedConfig: ServiceNowConfig = config ? { ...defaultConfig, ...config } : defaultConfig;
  return (
    <ServiceNowContext.Provider value={mergedConfig}>
      {children}
    </ServiceNowContext.Provider>
  );
}

export function useServiceNow(): ServiceNowConfig {
  return useContext(ServiceNowContext);
}
