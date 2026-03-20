// SearchService — reference field typeahead search.
// General-purpose: usable by any component that needs to search ServiceNow records.
// Results are never cached.

import { get, TABLE_API_BASE } from './ServiceNowClient';
import { RawRecord, ReferenceSearchResult } from '../types/index';

const DEFAULT_LIMIT = 15;
const DEFAULT_DISPLAY_VALUE_FIELD = 'name';

// Searches a table for records matching term.
// displayValueField defaults to 'name' if not provided.
// filter is an additional encoded query ANDed onto the search conditions.
export async function searchRecords(
  table: string,
  term: string,
  searchFields?: string[],
  limit?: number,
  filter?: string,
  displayValueField?: string,
): Promise<ReferenceSearchResult[]> {
  const dvField = displayValueField ?? DEFAULT_DISPLAY_VALUE_FIELD;

  // Build deduplicated list: display value field always first, then any additional fields.
  const allFields = [dvField, ...(searchFields ?? []).filter(f => f !== dvField)];

  // OR-combined CONTAINS query across all search fields.
  const searchParts = allFields.map(f => `${f}CONTAINS${term}`);
  let query = searchParts.join('^OR');

  // AND developer-supplied filter onto the search conditions.
  if (filter) {
    query = `(${query})^${filter}`;
  }

  const params: Record<string, string> = {
    sysparm_query: query,
    sysparm_display_value: 'all',
    sysparm_fields: ['sys_id', ...allFields].join(','),
    sysparm_limit: String(limit ?? DEFAULT_LIMIT),
  };

  const rows = await get<RawRecord[]>(`${TABLE_API_BASE}/${table}`, params);

  return rows.map(row => ({
    sysId: row['sys_id']?.value ?? '',
    displayValue: row[dvField]?.display_value ?? row[dvField]?.value ?? '',
    columns: allFields.map(f => ({
      field: f,
      value: row[f]?.display_value ?? row[f]?.value ?? '',
    })),
  }));
}
