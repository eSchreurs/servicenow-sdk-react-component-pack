// RhinoService — server-side metadata and qualifier resolution via the Rhino API.
// getRecordMetadata: one call per form load; result is cached for the session.
// resolveQualifier: called when a reference field becomes dirty; never cached
//   (the dirty flag is the cache mechanism — callers only call this when needed).

import { post } from './ServiceNowClient';
import { cached } from './CacheService';
import { FieldData } from '../types/index';

const RHINO_METADATA_ENDPOINT = '/api/x_326171_ssdk_pack/rhino/metadata';
const RHINO_QUALIFIER_ENDPOINT = '/api/x_326171_ssdk_pack/rhino/qualifier';

// Normalise null → undefined for optional fields coming from the server.
function normaliseFieldData(raw: any): FieldData {
  const fd: FieldData = {
    name: raw.name,
    label: raw.label,
    mandatory: raw.mandatory,
    readOnly: raw.readOnly,
    maxLength: raw.maxLength,
    type: raw.type,
    isChoiceField: raw.isChoiceField,
    choices: raw.choices ?? [],
    value: raw.value ?? '',
    displayValue: raw.displayValue ?? '',
  };
  if (raw.reference != null) fd.reference = raw.reference;
  if (raw.useReferenceQualifier != null) fd.useReferenceQualifier = raw.useReferenceQualifier;
  if (raw.referenceQual != null) fd.referenceQual = raw.referenceQual;
  if (raw.dynamicRefQual != null) fd.dynamicRefQual = raw.dynamicRefQual;
  if (raw.dependentOnField != null) fd.dependentOnField = raw.dependentOnField;
  return fd;
}

// Fetches metadata + current values for all requested fields in one round-trip.
// Result is cached per table/sysId/field-set combination.
// Pass empty string for sysId when loading a new (unsaved) record.
export async function getRecordMetadata(
  table: string,
  sysId: string,
  fields: string[],
): Promise<Record<string, FieldData>> {
  if (fields.length === 0) return {};

  const cacheKey = `recordmetadata:${table}:${sysId}:${[...fields].sort().join(',')}`;
  return cached<Record<string, FieldData>>(cacheKey, async () => {
    try {
      const data = await post<{ result: Record<string, any> | null; error?: string }>(
        RHINO_METADATA_ENDPOINT,
        { table, sysId, fields },
      );
      if (!data.result) return {};
      const result: Record<string, FieldData> = {};
      for (const key of Object.keys(data.result)) {
        result[key] = normaliseFieldData(data.result[key]);
      }
      return result;
    } catch {
      return {};
    }
  });
}

// Evaluates the reference qualifier for `field` on `table`, applying `currentValues`
// (unsaved form state) so the qualifier evaluates against the live form context.
// Pass empty string for sysId when the record has not been saved yet.
// Returns the resolved encoded query string, or empty string on any error.
// NEVER cached — callers use their own dirty flag to decide when to call this.
export async function resolveQualifier(
  table: string,
  sysId: string,
  field: string,
  currentValues: Record<string, string>,
): Promise<string> {
  try {
    const data = await post<{ result: string }>(
      RHINO_QUALIFIER_ENDPOINT,
      { table, sysId, field, currentValues },
    );
    return data.result ?? '';
  } catch {
    return '';
  }
}
