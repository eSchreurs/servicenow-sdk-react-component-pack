import React, { useReducer, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useServiceNow } from '../../context/ServiceNowContext';
import { Field } from './fields/Field';
import { Spinner } from '../primitives/Spinner';
import { Button } from '../actions/Button';
import * as RhinoService from '../../services/RhinoService';
import * as RecordService from '../../services/RecordService';
import {
  FieldData,
  FieldDefinition,
  FormButton,
  FormSection,
  SaveResult,
} from '../../types/index';

// ---------------------------------------------------------------------------
// Public props interface
// ---------------------------------------------------------------------------

export interface FormProps {
  sections: FormSection[];         // One or more sections, each with optional title and columns
  title?: string;                  // Optional form title rendered above all sections
  readOnly?: boolean;              // Makes entire form read-only (default: false)
  showSaveButton?: boolean;        // Default: true
  showCancelButton?: boolean;      // Default: false
  extraButtons?: FormButton[];     // Additional buttons rendered alongside Save / Cancel
  onSave?: (results: SaveResult[]) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  onFieldChange?: (field: FieldDefinition, value: string, displayValue: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

// ---------------------------------------------------------------------------
// Internal state shape
// ---------------------------------------------------------------------------

interface FormRecordEntry {
  value: string;
  displayValue: string;
}

interface FormState {
  status: 'loading' | 'ready' | 'saving' | 'error';
  metadata: Record<string, FieldData>;           // keyed by field name
  formRecord: Record<string, FormRecordEntry>;   // keyed by 'table.field'
  validationErrors: string[];                    // 'table.field' keys of failing fields
  saveError: string | null;
  loadError: string | null;
}

// ---------------------------------------------------------------------------
// Reducer actions
// ---------------------------------------------------------------------------

type FormAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; metadata: Record<string, FieldData>; formRecord: Record<string, FormRecordEntry> }
  | { type: 'LOAD_ERROR'; error: Error }
  | { type: 'FIELD_CHANGED'; field: string; value: string; displayValue: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; error: Error }
  | { type: 'VALIDATION_FAILED'; fields: string[] }
  | { type: 'DISMISS_ERROR' };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const INITIAL_STATE: FormState = {
  status: 'loading',
  metadata: {},
  formRecord: {},
  validationErrors: [],
  saveError: null,
  loadError: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...INITIAL_STATE, status: 'loading' };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        status: 'ready',
        metadata: action.metadata,
        formRecord: action.formRecord,
        validationErrors: [],
        saveError: null,
        loadError: null,
      };

    case 'LOAD_ERROR':
      return { ...state, status: 'error', loadError: action.error.message };

    case 'FIELD_CHANGED': {
      // Extract just the field name from the 'table.field' key
      const dotIndex = action.field.indexOf('.');
      const changedFieldName = dotIndex >= 0 ? action.field.slice(dotIndex + 1) : action.field;

      const newFormRecord: Record<string, FormRecordEntry> = {
        ...state.formRecord,
        [action.field]: { value: action.value, displayValue: action.displayValue },
      };

      // Clear dependent choice fields whose current value is no longer valid
      for (const [depFieldName, meta] of Object.entries(state.metadata)) {
        if (!meta.isChoiceField || meta.dependentOnField !== changedFieldName) continue;

        // Find all formRecord entries for this dependent field (may appear in multiple tables)
        const formKeys = Object.keys(newFormRecord).filter((k) => {
          const kDotIndex = k.indexOf('.');
          return kDotIndex >= 0 && k.slice(kDotIndex + 1) === depFieldName;
        });

        for (const key of formKeys) {
          const currentValue = newFormRecord[key].value;
          if (!currentValue) continue;

          // Valid choices are those with no dependentValue, or whose dependentValue matches
          const validChoices = meta.choices.filter(
            (c) => !c.dependentValue || c.dependentValue === action.value,
          );
          const isStillValid = validChoices.some((c) => c.value === currentValue);

          if (!isStillValid) {
            newFormRecord[key] = { value: '', displayValue: '' };
          }
        }
      }

      return { ...state, formRecord: newFormRecord };
    }

    case 'SAVE_START':
      return { ...state, status: 'saving', saveError: null };

    case 'SAVE_SUCCESS':
      return { ...state, status: 'ready', validationErrors: [], saveError: null };

    case 'SAVE_ERROR':
      return { ...state, status: 'ready', saveError: action.error.message };

    case 'VALIDATION_FAILED':
      return { ...state, validationErrors: action.fields };

    case 'DISMISS_ERROR':
      return { ...state, saveError: null, validationErrors: [] };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function flattenDefs(sections: FormSection[]): FieldDefinition[] {
  return sections.reduce<FieldDefinition[]>(
    (acc, section) => section.columns.reduce<FieldDefinition[]>((a, col) => a.concat(col), acc),
    [],
  );
}

function formRecordKey(table: string, field: string): string {
  return `${table}.${field}`;
}

// ---------------------------------------------------------------------------
// Form component
// ---------------------------------------------------------------------------

export function Form({
  sections,
  title,
  readOnly = false,
  showSaveButton = true,
  showCancelButton = false,
  extraButtons,
  onSave,
  onCancel,
  onError,
  onFieldChange,
  style,
  className,
}: FormProps): React.ReactElement {
  const theme = useTheme();
  const { language } = useServiceNow();
  const [state, dispatch] = useReducer(formReducer, INITIAL_STATE);

  // ---------------------------------------------------------------------------
  // Data loading on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    dispatch({ type: 'LOAD_START' });

    const allDefs = flattenDefs(sections);

    // Group unique tables → one RhinoService call per table
    const tableToFields = new Map<string, string[]>();
    for (const def of allDefs) {
      if (!tableToFields.has(def.table)) tableToFields.set(def.table, []);
      tableToFields.get(def.table)!.push(def.field);
    }

    const metaPromises = Array.from(tableToFields.entries()).map(([table, fields]) =>
      RhinoService.getRecordMetadata(table, fields, language),
    );

    // Group unique table+sysId pairs (non-empty sysId only) → one RecordService call per pair
    const recordKeyToRecord = new Map<string, { table: string; sysId: string; fields: string[] }>();
    for (const def of allDefs) {
      if (!def.sysId) continue;
      const key = `${def.table}:${def.sysId}`;
      if (!recordKeyToRecord.has(key)) {
        recordKeyToRecord.set(key, { table: def.table, sysId: def.sysId, fields: [] });
      }
      recordKeyToRecord.get(key)!.fields.push(def.field);
    }

    const recordPromises = Array.from(recordKeyToRecord.values()).map(({ table, sysId, fields }) =>
      RecordService.getRecord(table, sysId, fields).then((record) => ({ table, sysId, record })),
    );

    Promise.all([Promise.all(metaPromises), Promise.all(recordPromises)])
      .then(([metaResults, recordResults]) => {
        // Merge metadata from all tables — field names are unique per table
        const metadata: Record<string, FieldData> = {};
        for (const metaMap of metaResults) {
          Object.assign(metadata, metaMap);
        }

        // Build formRecord keyed by 'table.field'
        const formRecord: Record<string, FormRecordEntry> = {};
        for (const def of allDefs) {
          const key = formRecordKey(def.table, def.field);
          if (key in formRecord) continue; // deduplicate if same field declared twice

          const loadedEntry = recordResults.find(
            (r) => r.table === def.table && r.sysId === def.sysId,
          );
          const fieldValue = loadedEntry?.record[def.field];

          if (fieldValue) {
            formRecord[key] = { value: fieldValue.value, displayValue: fieldValue.displayValue };
          } else if (def.sysId === '' && def.defaultValue !== undefined) {
            formRecord[key] = { value: def.defaultValue, displayValue: def.defaultValue };
          } else {
            formRecord[key] = { value: '', displayValue: '' };
          }
        }

        dispatch({ type: 'LOAD_SUCCESS', metadata, formRecord });
      })
      .catch((err: Error) => {
        dispatch({ type: 'LOAD_ERROR', error: err });
        onError?.(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally runs once on mount — columns are captured at mount time

  // ---------------------------------------------------------------------------
  // Field change handler
  // ---------------------------------------------------------------------------

  const handleFieldChange = useCallback(
    (fieldName: string, value: string, displayValue: string, def: FieldDefinition) => {
      const key = formRecordKey(def.table, fieldName);
      dispatch({ type: 'FIELD_CHANGED', field: key, value, displayValue });
      // Call onFieldChange after dispatching — reducer has processed the change
      onFieldChange?.(def, value, displayValue);
    },
    [onFieldChange],
  );

  // ---------------------------------------------------------------------------
  // Save handler
  // ---------------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    const allDefs = flattenDefs(sections);

    // Validate: mandatory, not read-only, visible, and empty value
    const failingKeys: string[] = [];
    for (const def of allDefs) {
      const visible = def.visible !== false;
      if (!visible) continue;

      const meta = state.metadata[def.field];
      const effectiveMandatory = (meta?.mandatory ?? false) || (def.mandatory ?? false);
      const effectiveReadOnly =
        (meta?.readOnly ?? false) || (def.readOnly ?? false) || readOnly;

      if (effectiveMandatory && !effectiveReadOnly) {
        const key = formRecordKey(def.table, def.field);
        const entry = state.formRecord[key];
        if (!entry || entry.value === '') {
          failingKeys.push(key);
        }
      }
    }

    if (failingKeys.length > 0) {
      dispatch({ type: 'VALIDATION_FAILED', fields: failingKeys });
      return;
    }

    dispatch({ type: 'SAVE_START' });

    // Group fields by table+sysId
    const groupMap = new Map<string, { table: string; sysId: string; fields: FieldDefinition[] }>();
    for (const def of allDefs) {
      if (def.visible === false) continue;
      const groupKey = `${def.table}:${def.sysId}`;
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, { table: def.table, sysId: def.sysId, fields: [] });
      }
      groupMap.get(groupKey)!.fields.push(def);
    }

    // Build save promises
    const savePromises = Array.from(groupMap.values()).map(async ({ table, sysId, fields }) => {
      // Build payload with stored values only — never display values
      const payload: Record<string, string> = {};
      for (const def of fields) {
        const key = formRecordKey(table, def.field);
        payload[def.field] = state.formRecord[key]?.value ?? '';
      }

      if (!sysId) {
        const created = await RecordService.createRecord(table, payload);
        const newSysId = created['sys_id']?.value ?? '';
        return { table, sysId: newSysId, isNew: true } as SaveResult;
      } else {
        await RecordService.updateRecord(table, sysId, payload);
        return { table, sysId, isNew: false } as SaveResult;
      }
    });

    try {
      const results = await Promise.all(savePromises);
      dispatch({ type: 'SAVE_SUCCESS' });
      onSave?.(results);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      dispatch({ type: 'SAVE_ERROR', error });
      onError?.(error);
    }
  }, [sections, state.metadata, state.formRecord, readOnly, onSave, onError]);

  // ---------------------------------------------------------------------------
  // Rendering helpers
  // ---------------------------------------------------------------------------

  const theme_ = theme; // alias for use inside inline functions below

  if (state.status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: theme_.spacingXl, ...style }} className={className}>
        <Spinner />
      </div>
    );
  }

  if (state.status === 'error' && state.loadError) {
    return (
      <div
        style={{
          padding: theme_.spacingLg,
          color: theme_.colorDanger,
          fontFamily: theme_.fontFamily,
          fontSize: theme_.fontSizeBase,
          border: `${theme_.borderWidth} solid ${theme_.colorDanger}`,
          borderRadius: theme_.borderRadius,
          ...style,
        }}
        className={className}
      >
        Failed to load form: {state.loadError}
      </div>
    );
  }

  const formTitleStyle: React.CSSProperties = {
    fontFamily: theme_.fontFamily,
    fontSize: theme_.fontSizeLarge,
    fontWeight: theme_.fontWeightBold,
    color: theme_.colorText,
    margin: 0,
    marginBottom: theme_.spacingLg,
    paddingBottom: theme_.spacingMd,
    borderBottom: `${theme_.borderWidth} solid ${theme_.colorBorder}`,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: theme_.fontFamily,
    fontSize: theme_.fontSizeBase,
    fontWeight: theme_.fontWeightMedium,
    color: theme_.colorText,
    margin: 0,
    marginBottom: theme_.spacingMd,
    paddingBottom: theme_.spacingSm,
    borderBottom: `${theme_.borderWidth} solid ${theme_.colorBorder}`,
  };

  const actionAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme_.spacingSm,
  };

  const messageStyle: React.CSSProperties = {
    fontFamily: theme_.fontFamily,
    fontSize: theme_.fontSizeSmall,
    color: theme_.colorDanger,
    marginBottom: theme_.spacingSm,
  };

  const isSaving = state.status === 'saving';

  function renderField(def: FieldDefinition): React.ReactElement | null {
    if (def.visible === false) return null;

    const key = formRecordKey(def.table, def.field);
    const meta = state.metadata[def.field];
    const entry = state.formRecord[key] ?? { value: '', displayValue: '' };

    const effectiveMandatory = (meta?.mandatory ?? false) || (def.mandatory ?? false);
    const effectiveReadOnly = (meta?.readOnly ?? false) || (def.readOnly ?? false) || readOnly;
    const label = def.label ?? meta?.label ?? def.field;
    const dependentOnField = meta?.dependentOnField;
    const dependentValue = dependentOnField
      ? state.formRecord[formRecordKey(def.table, dependentOnField)]?.value
      : undefined;
    const reactKey = `${def.table}.${def.sysId}.${def.field}`;

    return (
      <Field
        key={reactKey}
        name={def.field}
        label={label}
        type={meta?.type ?? 'string'}
        value={entry.value}
        displayValue={entry.displayValue}
        mandatory={effectiveMandatory}
        readOnly={effectiveReadOnly}
        hasError={state.validationErrors.includes(key)}
        onChange={(fieldName, value, displayValue) =>
          handleFieldChange(fieldName, value, displayValue, def)
        }
        maxLength={meta?.maxLength}
        isChoiceField={meta?.isChoiceField}
        choices={meta?.choices}
        dependentOnField={dependentOnField}
        dependentValue={dependentValue}
        reference={meta?.reference}
        referenceQual={meta?.referenceQual}
        filter={def.reference?.filter}
        searchFields={def.reference?.searchFields}
        previewFields={def.reference?.previewFields}
        table={def.table}
        sysId={def.sysId}
      />
    );
  }

  return (
    <div style={{ fontFamily: theme_.fontFamily, ...style }} className={className}>
      {/* Form title */}
      {title && <h2 style={formTitleStyle}>{title}</h2>}

      {/* Sections */}
      {sections.map((section, sectionIndex) => {
        const columnCount = section.columns.length;
        const gridStyle: React.CSSProperties = {
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: theme_.spacingLg,
        };

        return (
          <div key={sectionIndex} style={{ marginBottom: theme_.spacingXl }}>
            {section.title && <h3 style={sectionTitleStyle}>{section.title}</h3>}
            <div style={gridStyle}>
              {section.columns.map((col, colIndex) => (
                <div key={colIndex} style={{ display: 'flex', flexDirection: 'column', gap: theme_.spacingMd }}>
                  {col.map((def) => renderField(def))}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Action area */}
      <div style={actionAreaStyle}>
        {/* Validation summary */}
        {state.validationErrors.length > 0 && (
          <div style={messageStyle}>
            {state.validationErrors.length === 1
              ? '1 required field must be filled in.'
              : `${state.validationErrors.length} required fields must be filled in.`}
            {' '}
            <button
              onClick={() => dispatch({ type: 'DISMISS_ERROR' })}
              style={{
                background: 'none',
                border: 'none',
                color: theme_.colorDanger,
                cursor: 'pointer',
                padding: 0,
                fontFamily: theme_.fontFamily,
                fontSize: theme_.fontSizeSmall,
                textDecoration: 'underline',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Save error */}
        {state.saveError && (
          <div style={messageStyle}>
            Save failed: {state.saveError}
            {' '}
            <button
              onClick={() => dispatch({ type: 'DISMISS_ERROR' })}
              style={{
                background: 'none',
                border: 'none',
                color: theme_.colorDanger,
                cursor: 'pointer',
                padding: 0,
                fontFamily: theme_.fontFamily,
                fontSize: theme_.fontSizeSmall,
                textDecoration: 'underline',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: theme_.spacingSm }}>
          {showSaveButton && !readOnly && (
            <Button onClick={handleSave} disabled={isSaving} variant="primary">
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          )}
          {showCancelButton && (
            <Button onClick={() => onCancel?.()} disabled={isSaving} variant="secondary">
              Cancel
            </Button>
          )}
          {extraButtons?.map((btn, i) => (
            <Button
              key={i}
              onClick={btn.onClick}
              disabled={btn.disabled ?? false}
              loading={btn.loading ?? false}
              variant={btn.variant ?? 'secondary'}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
