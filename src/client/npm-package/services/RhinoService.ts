// RhinoService — server-side metadata resolution via the Rhino API.
// getRecordMetadata: one call per form load; result is cached per table+field-set.
// Metadata is static for the session — record values are never included here.
 
import { post } from './ServiceNowClient';
import { cached } from './CacheService';
import { FieldData } from '../types/index';
 
const RHINO_METADATA_ENDPOINT = '/api/x_326171_ssdk_pack/rhino/metadata';
 
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
  };
  if (raw.reference != null) fd.reference = raw.reference;
  if (raw.referenceQual != null) fd.referenceQual = raw.referenceQual;
  if (raw.dependentOnField != null) fd.dependentOnField = raw.dependentOnField;
  return fd;
}
 
// Fetches static field metadata for all requested fields in one round-trip.
// Cached per table+field-set+language — sysId is not part of the cache key because
// metadata is not record-specific. Failed fetches are never cached — a remount will retry.
export async function getRecordMetadata(
  table: string,
  fields: string[],
  language: string = 'en',
): Promise<Record<string, FieldData>> {
  if (fields.length === 0) return {};

  const cacheKey = `recordmetadata:${table}:${language}:${[...fields].sort().join(',')}`;
  return cached<Record<string, FieldData>>(cacheKey, async () => {
    const data = await post<{ result: Record<string, any> | null; error?: string }>(
      RHINO_METADATA_ENDPOINT,
      { table, fields, language },
    );
    if (!data.result) throw new Error(data.error ?? 'getRecordMetadata: server returned null result');
    const result: Record<string, FieldData> = {};
    for (const key of Object.keys(data.result)) {
      result[key] = normaliseFieldData(data.result[key]);
    }
    return result;
  });
}