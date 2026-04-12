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

// Primitives
export { Text } from './components/primitives/Text';
export { Label } from './components/primitives/Label';
export { Icon } from './components/primitives/Icon';
export type { IconName } from './components/primitives/Icon';
export { Spinner } from './components/primitives/Spinner';
export { EmptyState } from './components/primitives/EmptyState';

// Actions
export { Input } from './components/actions/Input';
export { Checkbox } from './components/actions/Checkbox';
export { Dropdown } from './components/actions/Dropdown';
export { Button } from './components/actions/Button';
export { Badge } from './components/actions/Badge';
export { Tooltip } from './components/actions/Tooltip';
export { Popover } from './components/actions/Popover';

// Forms
export { Form } from './components/forms/Form';
export type { FormProps } from './components/forms/Form';
export { Field } from './components/forms/fields/Field';
export type { FieldProps } from './components/forms/fields/Field';

// Lists
export { List } from './components/lists/List';
export type { ListProps } from './components/lists/List';
export { SearchBar } from './components/lists/SearchBar';
export type { SearchBarProps } from './components/lists/SearchBar';
export { ListToolbar } from './components/lists/ListToolbar';
export type { ListToolbarProps } from './components/lists/ListToolbar';
export { ListHeader, buildGridTemplate } from './components/lists/ListHeader';
export type { ListHeaderProps } from './components/lists/ListHeader';
export { ListRow } from './components/lists/ListRow';
export type { ListRowProps } from './components/lists/ListRow';
export { Pagination } from './components/lists/Pagination';
export type { PaginationProps } from './components/lists/Pagination';


// Types
export type {
  RawFieldValue,
  RawRecord,
  TableApiSingleResponse,
  TableApiListResponse,
  TableApiErrorResponse,
  FieldValue,
  ServiceNowRecord,
  FieldData,
  ChoiceEntry,
  ReferenceSearchResult,
  BaseFieldProps,
  ColumnDefinition,
  FieldDefinition,
  SaveResult,
  FormSection,
  FormButton,
} from './types/index';
export { ServiceNowError } from './types/index';