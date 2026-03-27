// RecordService — CRUD operations against the ServiceNow Table API.
// Results are never cached — records can change at any time during a session.

import { get, getList, post, patch, TABLE_API_BASE } from './ServiceNowClient';
import { RawRecord, ServiceNowRecord } from '../types/index';

function mapRecord(raw: RawRecord): ServiceNowRecord {
  const result: ServiceNowRecord = {};
  for (const field of Object.keys(raw)) {
    result[field] = {
      value: raw[field].value ?? '',
      displayValue: raw[field].display_value ?? raw[field].value ?? '',
    };
  }
  return result;
}

// Fetches a single record by sys_id. Always returns both value and display value.
export async function getRecord(
  table: string,
  sysId: string,
  fields?: string[],
): Promise<ServiceNowRecord> {
  const params: Record<string, string> = { sysparm_display_value: 'all' };
  if (fields && fields.length > 0) {
    params.sysparm_fields = fields.join(',');
  }
  const raw = await get<RawRecord>(`${TABLE_API_BASE}/${table}/${sysId}`, params);
  return mapRecord(raw);
}

// Creates a new record. fields must contain only actual stored values — never display values.
export async function createRecord(
  table: string,
  fields: Record<string, string>,
): Promise<ServiceNowRecord> {
  const raw = await post<RawRecord>(
    `${TABLE_API_BASE}/${table}`,
    fields as Record<string, unknown>,
    { sysparm_display_value: 'all' },
  );
  return mapRecord(raw);
}

// Fetches a page of records from a table. Results are never cached.
// sys_id is always included in the returned fields even if not explicitly requested.
// totalCount reflects the total number of matching records across all pages.
export async function getRecords(
  table: string,
  fields: string[],
  options?: {
    filter?: string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  },
): Promise<{ rows: ServiceNowRecord[]; totalCount: number }> {
  const resolvedFields = fields.includes('sys_id') ? fields : [...fields, 'sys_id'];
  const params: Record<string, string> = {
    sysparm_display_value: 'all',
    sysparm_count: 'true',
    sysparm_fields: resolvedFields.join(','),
    sysparm_limit: String(options?.limit ?? 20),
    sysparm_offset: String(options?.offset ?? 0),
  };
  if (options?.filter) {
    params.sysparm_query = options.filter;
  }
  if (options?.orderBy) {
    if (options.orderDirection === 'desc') {
      params.sysparm_orderby_desc = options.orderBy;
    } else {
      params.sysparm_orderby = options.orderBy;
    }
  }
  const { result, totalCount } = await getList<RawRecord[]>(`${TABLE_API_BASE}/${table}`, params);
  return { rows: result.map(mapRecord), totalCount };
}

// Updates an existing record. fields must contain only actual stored values — never display values.
// Only the declared fields are included in the payload — never the full record.
export async function updateRecord(
  table: string,
  sysId: string,
  fields: Record<string, string>,
): Promise<ServiceNowRecord> {
  const raw = await patch<RawRecord>(
    `${TABLE_API_BASE}/${table}/${sysId}`,
    fields as Record<string, unknown>,
    { sysparm_display_value: 'all' },
  );
  return mapRecord(raw);
}