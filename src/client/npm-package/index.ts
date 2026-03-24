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

// Atoms — foundation
export { Text } from './components/atoms/Text';
export { Label } from './components/atoms/Label';
export { FieldWrapper } from './components/atoms/FieldWrapper';
export { Icon } from './components/atoms/Icon';
export type { IconName } from './components/atoms/Icon';
export { Spinner } from './components/atoms/Spinner';

// Atoms — inputs
export { TextInput } from './components/atoms/TextInput';
export { TextArea } from './components/atoms/TextArea';
export { Checkbox } from './components/atoms/Checkbox';
export { SelectInput } from './components/atoms/SelectInput';
export type { SelectOption } from './components/atoms/SelectInput';
export { ReferenceInput } from './components/atoms/ReferenceInput';
export type { ReferenceResult, ReferenceSearchColumn } from './components/atoms/ReferenceInput';

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
