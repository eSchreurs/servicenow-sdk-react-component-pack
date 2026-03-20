// Theme
export type { Theme } from './theme/theme';
export { defaultTheme } from './theme/theme';

// Theme context
export { ThemeContext, ThemeProvider, useTheme } from './context/ThemeContext';

// ServiceNow context
export type { ServiceNowConfig } from './context/ServiceNowContext';
export { ServiceNowContext, ServiceNowProvider, useServiceNow } from './context/ServiceNowContext';

// Services — exported as namespaces so consumers call e.g. RecordService.getRecord()
export * as CacheService from './services/CacheService';
export * as ServiceNowClient from './services/ServiceNowClient';
export * as RecordService from './services/RecordService';
export * as SearchService from './services/SearchService';
export * as RhinoService from './services/RhinoService';

// Types
export type {
  RawFieldValue,
  RawRecord,
  TableApiSingleResponse,
  TableApiListResponse,
  TableApiErrorResponse,
  RecordFieldValue,
  ServiceNowRecord,
  FieldData,
  ChoiceEntry,
  ReferenceSearchResult,
} from './types/index';
export { ServiceNowError } from './types/index';
