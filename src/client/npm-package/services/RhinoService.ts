// RhinoService — server-side qualified reference field search.
// Calls the companion app Scripted REST endpoint which evaluates the qualifier
// via GlideScopedEvaluator, builds the search query, queries the reference table,
// and returns result rows. The qualifier expression never passes through the browser.
// Results are never cached.

import { post } from './ServiceNowClient';
import { ReferenceSearchResult } from '../types/index';

export const RHINO_ENDPOINT = '/api/x_326171_ssdk_pack/rhino/search';

// Performs a fully qualified reference field search server-side.
// table + sysId identify the record used as 'current' for qualifier evaluation.
// field is the reference field name — the endpoint reads its qualifier from sys_dictionary.
// On any error returns an empty array — never throws.
// Only call for 'dynamic' or 'advanced' qualifier types — caller's responsibility.
export async function searchWithQualifier(
  table: string,
  sysId: string,
  field: string,
  searchTerm: string,
  searchFields?: string[],
  limit?: number,
): Promise<ReferenceSearchResult[]> {
  try {
    return await post<ReferenceSearchResult[]>(RHINO_ENDPOINT, {
      table,
      sysId,
      field,
      searchTerm,
      searchFields: searchFields ?? [],
      limit: limit ?? 15,
    });
  } catch {
    return [];
  }
}
