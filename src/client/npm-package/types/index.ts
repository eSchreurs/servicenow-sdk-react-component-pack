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

export interface FieldData {
  name: string;
  label: string;
  mandatory: boolean;
  readOnly: boolean;
  maxLength: number;
  type: string;
  isChoiceField: boolean;
  reference?: string;
  useReferenceQualifier?: 'simple' | 'dynamic' | 'advanced';
  referenceQual?: string;
  dynamicRefQual?: string;
  dependentOnField?: string;
  choices: ChoiceEntry[];
  value: string;
  displayValue: string;
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
