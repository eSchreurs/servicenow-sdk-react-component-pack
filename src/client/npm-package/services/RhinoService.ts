// RhinoService — resolves the reference_qual or dynamic_ref_qual for a field.
// Calls the companion app Scripted REST endpoint which evaluates the qualifier
// via GlideScopedEvaluator server-side and returns the resolved encoded query string.
// The qualifier script never passes through the browser.
// Callers cache the result and pass it as the `filter` param to SearchService.searchRecords().

import { post } from './ServiceNowClient';

export const RHINO_ENDPOINT = '/api/x_326171_ssdk_pack/rhino/search';

// Resolves the reference qualifier for `field` on `table`, evaluated against
// the record identified by `sysId` (pass empty string for new records).
// Returns the encoded query string (e.g. "active=true^group=abc123"),
// or an empty string when there is no qualifier or on any error.
export async function resolveQualifier(
  table: string,
  sysId: string,
  field: string,
): Promise<string> {
  try {
    const data = await post<{ result: string }>(RHINO_ENDPOINT, { table, sysId, field });
    return data.result ?? '';
  } catch {
    return '';
  }
}
