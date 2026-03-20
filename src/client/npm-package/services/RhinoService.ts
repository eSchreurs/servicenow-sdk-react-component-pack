// RhinoService — server-side evaluation of reference field qualifiers.
// Calls the companion app Scripted REST endpoint which evaluates the qualifier
// via GlideScopedEvaluator and returns an encoded query string.
// Results are never cached.

import { post } from './ServiceNowClient';

export const RHINO_ENDPOINT = '/api/x_est_react_pack/rhino/resolve';

// Calls the Rhino endpoint to resolve a dynamic or advanced qualifier for the
// given field on the given record. Returns the encoded query string on success,
// or an empty string on any error — never throws.
// Only call for 'dynamic' or 'advanced' qualifier types — caller's responsibility.
export async function resolveQualifier(
  table: string,
  sysId: string,
  field: string,
): Promise<string> {
  try {
    const resolvedFilter = await post<string>(RHINO_ENDPOINT, { table, sysId, field });
    return resolvedFilter ?? '';
  } catch {
    return '';
  }
}
