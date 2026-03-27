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
export { Icon } from './components/atoms/Icon';
export type { IconName } from './components/atoms/Icon';
export { Spinner } from './components/atoms/Spinner';
export { EmptyState } from './components/atoms/EmptyState';

// Atoms — inputs
export { Input } from './components/atoms/Input';
export { Checkbox } from './components/atoms/Checkbox';
export { Dropdown } from './components/atoms/Dropdown';
export { Field } from './components/atoms/Field';
export type { FieldProps } from './components/atoms/Field';

// Atoms — feedback & action
export { Button } from './components/atoms/Button';
export { Badge } from './components/atoms/Badge';
export { Tooltip } from './components/atoms/Tooltip';
export { Popover } from './components/atoms/Popover';

// Molecules
export { SearchBar } from './components/molecules/SearchBar';
export type { SearchBarProps } from './components/molecules/SearchBar';
export { ListToolbar } from './components/molecules/ListToolbar';
export type { ListToolbarProps } from './components/molecules/ListToolbar';
export { ListHeader, buildGridTemplate } from './components/molecules/ListHeader';
export type { ListHeaderProps } from './components/molecules/ListHeader';
export { ListRow } from './components/molecules/ListRow';
export type { ListRowProps } from './components/molecules/ListRow';
export { Pagination } from './components/molecules/Pagination';
export type { PaginationProps } from './components/molecules/Pagination';

// Organisms
export { Form } from './components/organisms/Form';
export type { FormProps } from './components/organisms/Form';
export { List } from './components/organisms/List';
export type { ListProps } from './components/organisms/List';

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
  ListRow,
  ColumnDefinition,
  FieldDefinition,
  SaveResult,
  FormSection,
  FormButton,
} from './types/index';
export { ServiceNowError } from './types/index';
