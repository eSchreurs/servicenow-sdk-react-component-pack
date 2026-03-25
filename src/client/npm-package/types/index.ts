import type React from 'react';

// ---------------------------------------------------------------------------
// API Response Shapes — raw shapes from the ServiceNow REST API.
// These are never consumed by components directly.
// ---------------------------------------------------------------------------
 
export interface RawFieldValue {
  value: string;
  display_value: string;
}
 
export type RawRecord = Record<string, RawFieldValue>;
 
export interface TableApiSingleResponse {
  result: RawRecord;
}
 
export interface TableApiListResponse {
  result: RawRecord[];
}
 
export interface TableApiErrorResponse {
  error: {
    message: string;
    detail: string;
  };
  status: 'failure';
}
 
// ---------------------------------------------------------------------------
// Domain Models — mapped objects consumed by services and components.
// ---------------------------------------------------------------------------
 
export interface RecordFieldValue {
  value: string;
  displayValue: string;
}
 
export type ServiceNowRecord = Record<string, RecordFieldValue>;
 
// Static field metadata returned by RhinoService.getRecordMetadata().
// Never contains record values — those come from RecordService.
export interface FieldData {
  name: string;
  label: string;
  mandatory: boolean;
  readOnly: boolean;
  maxLength: number;
  type: string;
  isChoiceField: boolean;
  choices: ChoiceEntry[];
  reference?: string;
  referenceQual?: string;
  dependentOnField?: string;
}
 
export interface ChoiceEntry {
  value: string;
  label: string;
  dependentValue?: string;
}
 
export interface ReferenceSearchResult {
  sysId: string;
  displayValue: string;
  columns: Array<{ field: string; value: string }>;
}
 
// ---------------------------------------------------------------------------
// Base Field Props — shared by all field molecules
// ---------------------------------------------------------------------------

export interface BaseFieldProps {
  name: string;
  label: string;
  value: string;
  displayValue: string;
  mandatory: boolean;
  readOnly: boolean;
  hasError: boolean;
  maxLength?: number;
  onChange: (field: string, value: string, displayValue: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

// ---------------------------------------------------------------------------
// Form Types
// ---------------------------------------------------------------------------

export interface FieldDefinition {
  // Required
  table: string;
  sysId: string;    // Empty string '' for new records
  field: string;

  // Optional overrides (developer overrides can only add restrictions, not remove them)
  label?: string;
  mandatory?: boolean;
  readOnly?: boolean;
  visible?: boolean;       // Default: true. When false, not rendered, excluded from validation/save
  defaultValue?: string;   // Pre-populate for new records (sysId = '') only

  // Reference field config
  reference?: {
    searchFields?: string[];
    previewFields?: string[];
    filter?: string;       // Reactive — always uses latest value when searching
  };
}

export interface SaveResult {
  table: string;
  sysId: string;   // For new records, the newly created sys_id
  isNew: boolean;
}

export interface FormSection {
  title?: string;            // Optional section header
  columns: FieldDefinition[][];  // Each inner array is a column; fields render top-to-bottom
}

export interface FormButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------
 
export class ServiceNowError extends Error {
  status: number;
  detail: string;
 
  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = 'ServiceNowError';
    this.status = status;
    this.detail = detail;
  }
}