import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FieldWrapper } from './_internal/FieldWrapper';
import { snToInput, inputToSn, formatReadOnly, DateMode } from './_internal/dateHelpers';
import { Input } from './Input';
import { Checkbox } from './Checkbox';
import { Dropdown } from './Dropdown';
import { ReferenceInput } from './_internal/ReferenceInput';
import { Popover } from './Popover';
import * as SearchService from '../../services/SearchService';
import * as RecordService from '../../services/RecordService';
import * as RhinoService from '../../services/RhinoService';
import { ChoiceEntry, ReferenceSearchResult, ServiceNowRecord, FieldData } from '../../types/index';

export interface FieldProps {
  // Core — always required
  name: string;
  label: string;
  type: string;
  value: string;
  displayValue?: string;
  mandatory: boolean;
  readOnly: boolean;
  hasError: boolean;
  onChange: (field: string, value: string, displayValue: string) => void;

  // Shared optional
  maxLength?: number;
  style?: React.CSSProperties;
  className?: string;

  // Choice props
  choices?: ChoiceEntry[];
  dependentOnField?: string;
  dependentValue?: string;

  // DateTime props
  mode?: DateMode;

  // Reference props
  reference?: string;
  referenceQual?: string;
  filter?: string;
  searchFields?: string[];
  previewFields?: string[];
  table?: string;
  sysId?: string;

  // isChoiceField flag — takes priority in type resolution
  isChoiceField?: boolean;
}

// ---------------------------------------------------------------------------
// Type resolution
// ---------------------------------------------------------------------------

type InputKind = 'textinput' | 'number' | 'textarea' | 'checkbox' | 'choice' | 'reference' | 'datetime' | 'date' | 'time';

function resolveKind(type: string, isChoiceField: boolean | undefined, maxLength: number | undefined): InputKind {
  if (isChoiceField) return 'choice';
  switch (type) {
    case 'string':         return maxLength !== undefined && maxLength > 255 ? 'textarea' : 'textinput';
    case 'text':
    case 'html':
    case 'translated_text': return 'textarea';
    case 'integer':
    case 'decimal':
    case 'float':
    case 'currency':       return 'number';
    case 'boolean':        return 'checkbox';
    case 'reference':      return 'reference';
    case 'glide_date_time': return 'datetime';
    case 'glide_date':     return 'date';
    case 'glide_time':     return 'time';
    default:               return 'textinput';
  }
}

// ---------------------------------------------------------------------------
// Reference helpers
// ---------------------------------------------------------------------------

function humanise(fieldName: string): string {
  return fieldName.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildEffectiveFilter(referenceQual?: string, filter?: string): string | undefined {
  if (referenceQual && filter) return `(${referenceQual})^${filter}`;
  return referenceQual ?? filter;
}

interface PopoverRow { label: string; displayValue: string; }

// ---------------------------------------------------------------------------
// Private ReferenceField sub-component — state only lives when kind=reference
// ---------------------------------------------------------------------------

type ReferenceFieldInternalProps = Pick<FieldProps,
  'name' | 'label' | 'mandatory' | 'readOnly' | 'hasError' | 'value' |
  'displayValue' | 'onChange' | 'reference' | 'referenceQual' | 'filter' |
  'searchFields' | 'previewFields' | 'style' | 'className'
>;

function ReferenceField({
  name, label, mandatory, readOnly, hasError, value, displayValue = '',
  onChange, reference, referenceQual, filter, searchFields, previewFields,
  style, className,
}: ReferenceFieldInternalProps): React.ReactElement {
  const theme = useTheme();

  const [searchResults, setSearchResults] = useState<ReferenceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverRows, setPopoverRows] = useState<PopoverRow[]>([]);
  const [popoverLoading, setPopoverLoading] = useState(false);
  const [popoverError, setPopoverError] = useState<string | undefined>(undefined);

  const searchGenRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchGenRef.current += 1;
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(undefined);
  };

  useEffect(() => { clearSearch(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleSearchTermChange = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.length < 2) { clearSearch(); return; }

    setIsSearching(true);
    setSearchError(undefined);
    const effectiveFilter = buildEffectiveFilter(referenceQual, filter);

    debounceRef.current = setTimeout(async () => {
      const gen = ++searchGenRef.current;
      try {
        const results = await SearchService.searchRecords(reference ?? '', term, searchFields, 15, effectiveFilter);
        if (gen === searchGenRef.current) { setSearchResults(results); setIsSearching(false); }
      } catch (e) {
        if (gen === searchGenRef.current) {
          setSearchError(e instanceof Error ? e.message : 'Search failed');
          setIsSearching(false);
        }
      }
    }, 300);
  }, [reference, referenceQual, filter, searchFields]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReferenceChange = useCallback((sysId: string, dv: string) => {
    clearSearch();
    onChange(name, sysId, dv);
  }, [name, onChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReferenceClear = useCallback(() => {
    clearSearch();
    onChange(name, '', '');
  }, [name, onChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInfoClick = useCallback(async () => {
    if (!value) return;
    setPopoverOpen(true);
    setPopoverLoading(true);
    setPopoverError(undefined);
    setPopoverRows([]);
    try {
      if (previewFields && previewFields.length > 0) {
        const [record, metadata] = await Promise.all([
          RecordService.getRecord(reference ?? '', value, previewFields),
          RhinoService.getRecordMetadata(reference ?? '', previewFields),
        ]);
        setPopoverRows(previewFields.map((field) => {
          const meta: FieldData | undefined = metadata[field];
          return { label: meta ? meta.label : humanise(field), displayValue: record[field]?.displayValue ?? '' };
        }));
      } else {
        const record: ServiceNowRecord = await RecordService.getRecord(reference ?? '', value);
        setPopoverRows(
          Object.keys(record)
            .filter((f) => !f.startsWith('sys_') && record[f].displayValue !== '')
            .map((f) => ({ label: humanise(f), displayValue: record[f].displayValue })),
        );
      }
    } catch (e) {
      setPopoverError(e instanceof Error ? e.message : 'Failed to load record');
    } finally {
      setPopoverLoading(false);
    }
  }, [value, reference, previewFields]);

  const popoverContent = popoverLoading ? (
    <div style={{ color: theme.colorTextMuted, fontSize: theme.fontSizeSmall }}>Loading...</div>
  ) : popoverError ? (
    <div style={{ color: theme.colorDanger, fontSize: theme.fontSizeSmall }}>{popoverError}</div>
  ) : (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: theme.fontSizeSmall }}>
      <tbody>
        {popoverRows.length === 0
          ? <tr><td style={{ color: theme.colorTextMuted }}>No fields to display</td></tr>
          : popoverRows.map((row) => (
            <tr key={row.label}>
              <td style={{ padding: `${theme.spacingXs} ${theme.spacingSm} ${theme.spacingXs} 0`, color: theme.colorTextMuted, fontWeight: theme.fontWeightMedium, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                {row.label}
              </td>
              <td style={{ padding: `${theme.spacingXs} 0`, color: theme.colorText, wordBreak: 'break-word' }}>
                {row.displayValue}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );

  return (
    <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
      <div ref={anchorRef}>
        <ReferenceInput
          id={name} value={value} displayValue={displayValue}
          onChange={handleReferenceChange} onSearchTermChange={handleSearchTermChange}
          onClear={handleReferenceClear} onInfoClick={handleInfoClick}
          searchResults={searchResults} isSearching={isSearching} searchError={searchError}
          readOnly={readOnly} hasError={hasError}
        />
      </div>
      <Popover isOpen={popoverOpen} onClose={() => setPopoverOpen(false)} title={displayValue || label} anchorRef={anchorRef as React.RefObject<HTMLElement>}>
        {popoverContent}
      </Popover>
    </FieldWrapper>
  );
}

// ---------------------------------------------------------------------------
// Private DateField sub-component
// ---------------------------------------------------------------------------

type DateFieldInternalProps = Pick<FieldProps,
  'name' | 'label' | 'mandatory' | 'readOnly' | 'hasError' | 'value' |
  'onChange' | 'mode' | 'style' | 'className'
> & { dateKind: 'datetime' | 'date' | 'time' };

function DateField({
  name, label, mandatory, readOnly, hasError, value, onChange, mode, dateKind, style, className,
}: DateFieldInternalProps): React.ReactElement {
  const theme = useTheme();
  const dateMode: DateMode = mode ?? dateKind;

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', height: theme.inputHeight,
    padding: `0 ${theme.inputPaddingHorizontal}`,
    fontFamily: theme.fontFamily, fontSize: theme.fontSizeBase,
    color: theme.colorText, backgroundColor: theme.inputBackgroundColor,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius, boxSizing: 'border-box',
    outline: 'none', transition: `border-color ${theme.transitionSpeed}`,
  };

  const readOnlySpanStyle: React.CSSProperties = {
    display: 'block', fontFamily: theme.fontFamily, fontSize: theme.fontSizeBase,
    color: theme.colorText, lineHeight: theme.lineHeightBase,
    minHeight: theme.inputHeight, padding: `0 ${theme.inputPaddingHorizontal}`,
    alignContent: 'center',
  };

  if (readOnly) {
    return (
      <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
        <span id={name} style={readOnlySpanStyle}>{formatReadOnly(value, dateMode)}</span>
      </FieldWrapper>
    );
  }

  const inputType = dateMode === 'datetime' ? 'datetime-local' : dateMode;

  return (
    <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
      <input
        id={name} type={inputType} value={snToInput(value, dateMode)}
        onChange={(e) => onChange(name, inputToSn(e.target.value, dateMode), inputToSn(e.target.value, dateMode))}
        required={mandatory} style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = theme.colorBorderFocus; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = theme.colorBorder; }}
      />
    </FieldWrapper>
  );
}

// ---------------------------------------------------------------------------
// Field component
// ---------------------------------------------------------------------------

export function Field({
  name, label, type, value, displayValue = '', mandatory, readOnly, hasError,
  onChange, maxLength, style, className, choices, dependentValue, mode,
  reference, referenceQual, filter, searchFields, previewFields, isChoiceField,
}: FieldProps): React.ReactElement {
  const theme = useTheme();

  const kind = resolveKind(type, isChoiceField, maxLength);

  // Shorthand to avoid repeating the 6 FieldWrapper props on every return.
  const wrap = (children: React.ReactNode) => (
    <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
      {children}
    </FieldWrapper>
  );

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', height: theme.inputHeight,
    padding: `0 ${theme.inputPaddingHorizontal}`,
    fontFamily: theme.fontFamily, fontSize: theme.fontSizeBase,
    color: theme.colorText, backgroundColor: theme.inputBackgroundColor,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius, boxSizing: 'border-box',
    outline: 'none', transition: `border-color ${theme.transitionSpeed}`,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    height: 'auto',
    padding: theme.inputPaddingHorizontal,
    resize: 'vertical',
  };

  const readOnlySpanStyle: React.CSSProperties = {
    display: 'block', fontFamily: theme.fontFamily, fontSize: theme.fontSizeBase,
    color: theme.colorText, lineHeight: theme.lineHeightBase,
    minHeight: theme.inputHeight, padding: `0 ${theme.inputPaddingHorizontal}`,
    alignContent: 'center',
  };

  // --- text / number ---
  if (kind === 'textinput' || kind === 'number') {
    if (readOnly) return wrap(<span id={name} style={readOnlySpanStyle}>{value}</span>);
    return wrap(
      <Input id={name} value={value} onChange={(v) => onChange(name, v, v)}
        type={kind === 'number' ? 'number' : 'text'} style={inputStyle} />,
    );
  }

  // --- textarea ---
  if (kind === 'textarea') {
    if (readOnly) return wrap(<span id={name} style={{ ...readOnlySpanStyle, whiteSpace: 'pre-wrap', alignContent: undefined }}>{value}</span>);
    return wrap(
      <textarea id={name} value={value} rows={4} maxLength={maxLength} style={textareaStyle}
        onChange={(e) => onChange(name, e.target.value, e.target.value)}
        onFocus={(e) => { e.currentTarget.style.borderColor = theme.colorBorderFocus; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = theme.colorBorder; }}
      />,
    );
  }

  // --- checkbox ---
  if (kind === 'checkbox') {
    const boolValue = value === 'true';
    if (readOnly) {
      return wrap(
        <div style={{ display: 'inline-flex', alignItems: 'center', height: theme.inputHeight }}>
          <input id={name} type="checkbox" checked={boolValue} disabled onChange={() => undefined}
            style={{ width: '1rem', height: '1rem', cursor: 'default', accentColor: theme.colorPrimary }} />
        </div>,
      );
    }
    return wrap(
      <Checkbox id={name} value={boolValue}
        onChange={(checked) => { const s = checked ? 'true' : 'false'; onChange(name, s, s); }} />,
    );
  }

  // --- choice ---
  if (kind === 'choice') {
    const visibleChoices = (choices ?? []).filter((c) => !c.dependentValue || c.dependentValue === dependentValue);
    const options = visibleChoices.map((c) => ({ value: c.value, label: c.label }));
    if (readOnly) {
      const selectedLabel = visibleChoices.find((c) => c.value === value)?.label ?? value;
      return wrap(<span id={name} style={readOnlySpanStyle}>{selectedLabel}</span>);
    }
    return wrap(
      <Dropdown
        id={name} value={value} options={options} style={inputStyle}
        onChange={(selected) => {
          const match = visibleChoices.find((c) => c.value === selected);
          onChange(name, selected, match?.label ?? '');
        }}
        placeholder={!(mandatory && value !== '') ? '' : undefined}
      />,
    );
  }

  // --- reference ---
  if (kind === 'reference') {
    return (
      <ReferenceField
        name={name} label={label} mandatory={mandatory} readOnly={readOnly} hasError={hasError}
        value={value} displayValue={displayValue} onChange={onChange}
        reference={reference} referenceQual={referenceQual} filter={filter}
        searchFields={searchFields} previewFields={previewFields}
        style={style} className={className}
      />
    );
  }

  // --- datetime / date / time ---
  return (
    <DateField
      name={name} label={label} mandatory={mandatory} readOnly={readOnly} hasError={hasError}
      value={value} onChange={onChange} mode={mode}
      dateKind={kind as 'datetime' | 'date' | 'time'}
      style={style} className={className}
    />
  );
}
