// MetadataService — all read-only ServiceNow metadata.
// All results are cached for the browser session via CacheService.
// No service-level Map — all caching goes through CacheService.

import { cached } from './CacheService';
import { get, TABLE_API_BASE } from './ServiceNowClient';
import { RawRecord, FieldMetadata, ChoiceEntry } from '../types/index';

const HIERARCHY_ENDPOINT = '/api/x_326171_ssdk_pack/hierarchy';

// ---------------------------------------------------------------------------
// getTableHierarchy
// ---------------------------------------------------------------------------

export async function getTableHierarchy(table: string): Promise<string[]> {
  return cached<string[]>(`hierarchy:${table}`, async () => {
    const tables = await get<string[]>(`${HIERARCHY_ENDPOINT}/${table}`);
    // Verify most-specific-first: the queried table should be the first element.
    if (tables.length > 0 && tables[0] !== table) {
      tables.reverse();
    }
    return tables;
  });
}

// ---------------------------------------------------------------------------
// getFieldMetadata
// ---------------------------------------------------------------------------

// Internal: merge sys_dictionary rows for one field, most-specific-first.
function mergeFieldRows(rows: RawRecord[], tables: string[]): FieldMetadata[] {
  // Group rows by element (field name).
  const byField = new Map<string, RawRecord[]>();
  for (const row of rows) {
    const fieldName = row['element']?.value ?? '';
    if (!fieldName) continue;
    if (!byField.has(fieldName)) byField.set(fieldName, []);
    byField.get(fieldName)!.push(row);
  }

  const result: FieldMetadata[] = [];

  for (const [fieldName, fieldRows] of byField) {
    // Sort rows by their table's position in the hierarchy (lower index = more specific).
    const sorted = [...fieldRows].sort((a, b) => {
      const ai = tables.indexOf(a['name']?.value ?? '');
      const bi = tables.indexOf(b['name']?.value ?? '');
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
    });

    // Booleans: OR across all rows.
    const mandatory = sorted.some(r => r['mandatory']?.value === 'true');
    const readOnly = sorted.some(r => r['read_only']?.value === 'true');

    // Strings: first non-empty, most-specific-first.
    const label = firstNonEmpty(sorted.map(r => r['column_label']?.value ?? ''));
    const type = firstNonEmpty(sorted.map(r => r['internal_type']?.value ?? ''));
    const reference = firstNonEmpty(sorted.map(r => r['reference']?.value ?? ''));
    const referenceLabel = firstNonEmpty(sorted.map(r => r['reference']?.display_value ?? ''));
    const referenceQualRaw = firstNonEmpty(sorted.map(r => r['use_reference_qualifier']?.value ?? ''));
    const referenceQual = firstNonEmpty(sorted.map(r => r['reference_qual']?.value ?? ''));
    const dynamicRefQual = firstNonEmpty(sorted.map(r => r['dynamic_ref_qual']?.value ?? ''));
    const dependentOnField = firstNonEmpty(sorted.map(r => r['dependent_on_field']?.value ?? ''));

    // Numbers: first non-zero, most-specific-first.
    const maxLength = firstNonZero(sorted.map(r => parseInt(r['max_length']?.value ?? '0', 10)));
    const choice = firstNonZero(sorted.map(r => parseInt(r['choice']?.value ?? '0', 10)));

    const metadata: FieldMetadata = {
      name: fieldName,
      label: label || fieldName,
      type: type || 'string',
      maxLength,
      mandatory,
      readOnly,
      choice,
    };

    if (reference) {
      metadata.reference = reference;
      if (referenceLabel) metadata.referenceLabel = referenceLabel;
    }

    if (referenceQualRaw === 'simple' || referenceQualRaw === 'dynamic' || referenceQualRaw === 'advanced') {
      metadata.useReferenceQualifier = referenceQualRaw;
    }
    if (referenceQual) metadata.referenceQual = referenceQual;
    if (dynamicRefQual) metadata.dynamicRefQual = dynamicRefQual;
    if (dependentOnField) metadata.dependentOnField = dependentOnField;

    result.push(metadata);
  }

  return result;
}

// Internal: fetch the display field name for each referenced table.
// Cache key: displayfield:{sorted tables joined by comma}
async function resolveDisplayFields(referencedTables: string[]): Promise<Record<string, string>> {
  const cacheKey = `displayfield:${[...referencedTables].sort().join(',')}`;
  return cached<Record<string, string>>(cacheKey, async () => {
    const rows = await get<RawRecord[]>(`${TABLE_API_BASE}/sys_dictionary`, {
      sysparm_query: `nameIN${referencedTables.join(',')}^display=true`,
      sysparm_fields: 'name,element',
      sysparm_display_value: 'all',
    });

    const map: Record<string, string> = {};
    for (const row of rows) {
      const tableName = row['name']?.value ?? '';
      const fieldName = row['element']?.value ?? '';
      if (tableName && fieldName && !map[tableName]) {
        map[tableName] = fieldName;
      }
    }
    return map;
  });
}

export async function getFieldMetadata(tables: string[], fields: string[]): Promise<FieldMetadata[]> {
  if (tables.length === 0 || fields.length === 0) return [];

  const cacheKey = `metadata:${[...tables].sort().join(',')}:${[...fields].sort().join(',')}`;
  return cached<FieldMetadata[]>(cacheKey, async () => {
    const rows = await get<RawRecord[]>(`${TABLE_API_BASE}/sys_dictionary`, {
      sysparm_query: `nameIN${tables.join(',')}^elementIN${fields.join(',')}`,
      sysparm_display_value: 'all',
      sysparm_fields: [
        'name', 'element', 'column_label', 'internal_type', 'max_length',
        'mandatory', 'read_only', 'choice', 'reference',
        'use_reference_qualifier', 'reference_qual', 'dynamic_ref_qual',
        'dependent_on_field',
      ].join(','),
    });

    const merged = mergeFieldRows(rows, tables);

    // Secondary batch query: resolve referenceDisplayField for all reference fields.
    const referencedTables = [
      ...new Set(merged.map(f => f.reference).filter((r): r is string => !!r)),
    ];
    if (referencedTables.length > 0) {
      const displayFieldMap = await resolveDisplayFields(referencedTables);
      for (const field of merged) {
        if (field.reference && displayFieldMap[field.reference]) {
          field.referenceDisplayField = displayFieldMap[field.reference];
        }
      }
    }

    return merged;
  });
}

// ---------------------------------------------------------------------------
// getChoices
// ---------------------------------------------------------------------------

export async function getChoices(
  tables: string[],
  fields: string[],
  language = 'en',
): Promise<Record<string, ChoiceEntry[]>> {
  if (tables.length === 0 || fields.length === 0) return {};

  const cacheKey = `choices:${[...tables].sort().join(',')}:${[...fields].sort().join(',')}:${language}`;
  return cached<Record<string, ChoiceEntry[]>>(cacheKey, async () => {
    const rows = await get<RawRecord[]>(`${TABLE_API_BASE}/sys_choice`, {
      sysparm_query: `nameIN${tables.join(',')}^elementIN${fields.join(',')}^language=${language}`,
      sysparm_display_value: 'all',
      sysparm_fields: 'name,element,value,label,dependent_value,sequence',
    });

    // Group by field name → table name.
    const byFieldByTable = new Map<string, Map<string, RawRecord[]>>();
    for (const row of rows) {
      const fieldName = row['element']?.value ?? '';
      const tableName = row['name']?.value ?? '';
      if (!fieldName || !tableName) continue;
      if (!byFieldByTable.has(fieldName)) byFieldByTable.set(fieldName, new Map());
      const byTable = byFieldByTable.get(fieldName)!;
      if (!byTable.has(tableName)) byTable.set(tableName, []);
      byTable.get(tableName)!.push(row);
    }

    const result: Record<string, ChoiceEntry[]> = {};
    for (const [fieldName, byTable] of byFieldByTable) {
      // Whole-table replacement: use choices from the most-specific table that has entries.
      let choiceRows: RawRecord[] | undefined;
      for (const tableName of tables) {
        if (byTable.has(tableName)) {
          choiceRows = byTable.get(tableName)!;
          break;
        }
      }
      if (!choiceRows) continue;

      // Sort by sequence.
      choiceRows.sort((a, b) => {
        const aSeq = parseInt(a['sequence']?.value ?? '0', 10);
        const bSeq = parseInt(b['sequence']?.value ?? '0', 10);
        return aSeq - bSeq;
      });

      result[fieldName] = choiceRows.map(r => {
        const entry: ChoiceEntry = {
          value: r['value']?.value ?? '',
          label: r['label']?.value ?? '',
        };
        const depVal = r['dependent_value']?.value ?? '';
        if (depVal) entry.dependentValue = depVal;
        return entry;
      });
    }

    return result;
  });
}

// ---------------------------------------------------------------------------
// getFieldLabels
// ---------------------------------------------------------------------------

export async function getFieldLabels(table: string, fields: string[]): Promise<Record<string, string>> {
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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function firstNonEmpty(values: string[]): string {
  return values.find(v => v !== '') ?? '';
}

function firstNonZero(values: number[]): number {
  return values.find(v => v !== 0) ?? 0;
}
