// RecordService — CRUD operations against the ServiceNow Table API.
// Results are never cached — records can change at any time during a session.
// getFieldLabels is cached: field labels are stable for the duration of a session.

import { get, post, patch, TABLE_API_BASE } from './ServiceNowClient';
import { cached } from './CacheService';
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

// Returns a map of field name → human-readable label for the given fields.
// Cached for the session — labels do not change during a user's session.
export async function getFieldLabels(
  table: string,
  fields: string[],
): Promise<Record<string, string>> {
  if (fields.length === 0) return {};

  const cacheKey = `labels:${table}:${[...fields].sort().join(',')}`;
  return cached<Record<string, string>>(cacheKey, async () => {
    const rows = await get<RawRecord[]>(`${TABLE_API_BASE}/sys_dictionary`, {
      sysparm_query: `name=${table}^elementIN${fields.join(',')}`,
      sysparm_fields: 'element,column_label',
      sysparm_display_value: 'all',
    });

    const result: Record<string, string> = {};
    for (const row of rows) {
      const fieldName = row['element']?.value ?? '';
      const label = row['column_label']?.value ?? '';
      if (fieldName) result[fieldName] = label;
    }
    return result;
  });
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
