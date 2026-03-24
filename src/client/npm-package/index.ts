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

// Atoms — feedback & action
export { Button } from './components/atoms/Button';
export { Badge } from './components/atoms/Badge';
export { Tooltip } from './components/atoms/Tooltip';
export { Popover } from './components/atoms/Popover';

// Molecules — field molecules
export { StringField } from './components/molecules/StringField';
export { TextAreaField } from './components/molecules/TextAreaField';
export { NumberField } from './components/molecules/NumberField';
export { CheckboxField } from './components/molecules/CheckboxField';
export { DateTimeField } from './components/molecules/DateTimeField';
export type { DateTimeFieldProps } from './components/molecules/DateTimeField';
export { ChoiceField } from './components/molecules/ChoiceField';
export type { ChoiceFieldProps } from './components/molecules/ChoiceField';
export { ReferenceField } from './components/molecules/ReferenceField';
export type { ReferenceFieldProps } from './components/molecules/ReferenceField';
export { SearchBar } from './components/molecules/SearchBar';
export type { SearchBarProps } from './components/molecules/SearchBar';

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
  BaseFieldProps,
} from './types/index';
export { ServiceNowError } from './types/index';
