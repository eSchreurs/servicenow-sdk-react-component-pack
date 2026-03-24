import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FieldWrapper } from '../atoms/FieldWrapper';
import { TextInput } from '../atoms/TextInput';
import { TextArea } from '../atoms/TextArea';
import { Checkbox } from '../atoms/Checkbox';
import { SelectInput } from '../atoms/SelectInput';
import { ReferenceInput } from '../atoms/ReferenceInput';
import { Popover } from '../atoms/Popover';
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

  // ChoiceField props
  choices?: ChoiceEntry[];
  dependentOnField?: string;
  dependentValue?: string;

  // DateTimeField props
  mode?: 'datetime' | 'date' | 'time';

  // ReferenceField props
  reference?: string;
  referenceQual?: string;
  filter?: string;
  searchFields?: string[];
  previewFields?: string[];
  table?: string;
  sysId?: string;

  // isChoiceField flag from FieldData — takes priority in type resolution
  isChoiceField?: boolean;
}

// ---------------------------------------------------------------------------
// Type resolution
// ---------------------------------------------------------------------------

type InputKind =
  | 'textinput'
  | 'number'
  | 'textarea'
  | 'checkbox'
  | 'choice'
  | 'reference'
  | 'datetime'
  | 'date'
  | 'time';

function resolveKind(
  type: string,
  isChoiceField: boolean | undefined,
  maxLength: number | undefined,
): InputKind {
  if (isChoiceField) return 'choice';
  switch (type) {
    case 'string':
      return maxLength !== undefined && maxLength > 255 ? 'textarea' : 'textinput';
    case 'text':
    case 'html':
    case 'translated_text':
      return 'textarea';
    case 'integer':
    case 'decimal':
    case 'float':
    case 'currency':
      return 'number';
    case 'boolean':
      return 'checkbox';
    case 'reference':
      return 'reference';
    case 'glide_date_time':
      return 'datetime';
    case 'glide_date':
      return 'date';
    case 'glide_time':
      return 'time';
    default:
      return 'textinput';
  }
}

// ---------------------------------------------------------------------------
// DateTime format helpers
// ---------------------------------------------------------------------------

function snToInputDatetime(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})/);
  if (match) return `${match[1]}T${match[2]}`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(sn)) return sn.slice(0, 16);
  return sn;
}

function snToInputDate(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : sn;
}

function snToInputTime(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : sn;
}

function inputDatetimeToSn(input: string): string {
  if (!input) return '';
  const match = input.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (match) return `${match[1]} ${match[2]}:00`;
  return input;
}

function inputDateToSn(input: string): string {
  return input;
}

function inputTimeToSn(input: string): string {
  if (!input) return '';
  if (/^\d{2}:\d{2}$/.test(input)) return `${input}:00`;
  return input;
}

function formatDatetimeReadOnly(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2})/);
  if (match) {
    const [, yyyy, mm, dd, hh, min] = match;
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
  return sn;
}

function formatDateReadOnly(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, yyyy, mm, dd] = match;
    return `${dd}/${mm}/${yyyy}`;
  }
  return sn;
}

function formatTimeReadOnly(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : sn;
}

// ---------------------------------------------------------------------------
// Reference helpers
// ---------------------------------------------------------------------------

function humanise(fieldName: string): string {
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildEffectiveFilter(referenceQual?: string, filter?: string): string | undefined {
  if (referenceQual && filter) return `(${referenceQual})^${filter}`;
  if (referenceQual) return referenceQual;
  if (filter) return filter;
  return undefined;
}

interface PopoverRow {
  label: string;
  displayValue: string;
}

// ---------------------------------------------------------------------------
// Field component
// ---------------------------------------------------------------------------

export function Field({
  name,
  label,
  type,
  value,
  displayValue = '',
  mandatory,
  readOnly,
  hasError,
  onChange,
  maxLength,
  style,
  className,
  choices,
  dependentValue,
  mode,
  reference,
  referenceQual,
  filter,
  searchFields,
  previewFields,
  isChoiceField,
}: FieldProps): React.ReactElement {
  const theme = useTheme();

  const kind = resolveKind(type, isChoiceField, maxLength);

  // --- Reference field state (always initialised; only active when kind === 'reference') ---
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

  // When filter changes: cancel in-flight search, clear results.
  useEffect(() => {
    if (kind !== 'reference') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchGenRef.current += 1;
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(undefined);
  }, [filter, kind]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchTermChange = useCallback(
    (term: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (term.length < 2) {
        searchGenRef.current += 1;
        setSearchResults([]);
        setIsSearching(false);
        setSearchError(undefined);
        return;
      }

      setIsSearching(true);
      setSearchError(undefined);

      const effectiveFilter = buildEffectiveFilter(referenceQual, filter);

      debounceRef.current = setTimeout(async () => {
        const gen = ++searchGenRef.current;
        try {
          const results = await SearchService.searchRecords(
            reference ?? '',
            term,
            searchFields,
            15,
            effectiveFilter,
          );
          if (gen === searchGenRef.current) {
            setSearchResults(results);
            setIsSearching(false);
          }
        } catch (e) {
          if (gen === searchGenRef.current) {
            setSearchError(e instanceof Error ? e.message : 'Search failed');
            setIsSearching(false);
          }
        }
      }, 300);
    },
    [reference, referenceQual, filter, searchFields],
  );

  const handleReferenceChange = useCallback(
    (sysId: string, dv: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      searchGenRef.current += 1;
      setSearchResults([]);
      setIsSearching(false);
      onChange(name, sysId, dv);
    },
    [name, onChange],
  );

  const handleReferenceClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchGenRef.current += 1;
    setSearchResults([]);
    setIsSearching(false);
    onChange(name, '', '');
  }, [name, onChange]);

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
        const rows: PopoverRow[] = previewFields.map((field) => {
          const fieldMeta: FieldData | undefined = metadata[field];
          const fieldLabel = fieldMeta ? fieldMeta.label : humanise(field);
          const fieldValue = record[field] ? record[field].displayValue : '';
          return { label: fieldLabel, displayValue: fieldValue };
        });
        setPopoverRows(rows);
      } else {
        const record: ServiceNowRecord = await RecordService.getRecord(reference ?? '', value);
        const rows: PopoverRow[] = Object.keys(record)
          .filter((field) => !field.startsWith('sys_') && record[field].displayValue !== '')
          .map((field) => ({
            label: humanise(field),
            displayValue: record[field].displayValue,
          }));
        setPopoverRows(rows);
      }
    } catch (e) {
      setPopoverError(e instanceof Error ? e.message : 'Failed to load record');
    } finally {
      setPopoverLoading(false);
    }
  }, [value, reference, previewFields]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (kind === 'textinput') {
    return (
      <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
        <TextInput
          id={name}
          value={value}
          onChange={(v) => onChange(name, v, v)}
          readOnly={readOnly}
          mandatory={mandatory}
          maxLength={maxLength}
          hasError={hasError}
        />
      </FieldWrapper>
    );
  }

  if (kind === 'number') {
    return (
      <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
        <TextInput
          id={name}
          value={value}
          onChange={(v) => onChange(name, v, v)}
          readOnly={readOnly}
          mandatory={mandatory}
          maxLength={maxLength}
          hasError={hasError}
          inputType="number"
        />
      </FieldWrapper>
    );
  }

  if (kind === 'textarea') {
    return (
      <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
        <TextArea
          id={name}
          value={value}
          onChange={(v) => onChange(name, v, v)}
          readOnly={readOnly}
          mandatory={mandatory}
          maxLength={maxLength}
          hasError={hasError}
        />
      </FieldWrapper>
    );
  }

  if (kind === 'checkbox') {
    const boolValue = value === 'true';
    return (
      <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
        <Checkbox
          id={name}
          value={boolValue}
          onChange={(checked) => {
            const str = checked ? 'true' : 'false';
            onChange(name, str, str);
          }}
          readOnly={readOnly}
          hasError={hasError}
        />
      </FieldWrapper>
    );
  }

  if (kind === 'choice') {
    const safeChoices = choices ?? [];
    const visibleChoices = safeChoices.filter((c) => {
      if (!c.dependentValue) return true;
      return c.dependentValue === dependentValue;
    });
    const showBlank = !(mandatory && value !== '');
    const options = visibleChoices.map((c) => ({ value: c.value, label: c.label }));

    function handleChoiceChange(selected: string): void {
      const match = visibleChoices.find((c) => c.value === selected);
      const selectedLabel = match ? match.label : '';
      onChange(name, selected, selectedLabel);
    }

    return (
      <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
        <SelectInput
          id={name}
          value={value}
          options={options}
          onChange={handleChoiceChange}
          readOnly={readOnly}
          mandatory={mandatory}
          hasError={hasError}
          placeholder={showBlank ? '' : undefined}
        />
      </FieldWrapper>
    );
  }

  if (kind === 'reference') {
    const popoverContent = popoverLoading ? (
      <div style={{ color: theme.colorTextMuted, fontSize: theme.fontSizeSmall }}>Loading...</div>
    ) : popoverError ? (
      <div style={{ color: theme.colorDanger, fontSize: theme.fontSizeSmall }}>{popoverError}</div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: theme.fontSizeSmall }}>
        <tbody>
          {popoverRows.map((row) => (
            <tr key={row.label}>
              <td style={{
                padding: `${theme.spacingXs} ${theme.spacingSm} ${theme.spacingXs} 0`,
                color: theme.colorTextMuted,
                fontWeight: theme.fontWeightMedium,
                whiteSpace: 'nowrap',
                verticalAlign: 'top',
              }}>
                {row.label}
              </td>
              <td style={{
                padding: `${theme.spacingXs} 0`,
                color: theme.colorText,
                wordBreak: 'break-word',
              }}>
                {row.displayValue}
              </td>
            </tr>
          ))}
          {popoverRows.length === 0 && (
            <tr>
              <td style={{ color: theme.colorTextMuted }}>No fields to display</td>
            </tr>
          )}
        </tbody>
      </table>
    );

    return (
      <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
        <div ref={anchorRef}>
          <ReferenceInput
            id={name}
            value={value}
            displayValue={displayValue}
            onChange={handleReferenceChange}
            onSearchTermChange={handleSearchTermChange}
            onClear={handleReferenceClear}
            onInfoClick={handleInfoClick}
            searchResults={searchResults}
            isSearching={isSearching}
            searchError={searchError}
            readOnly={readOnly}
            mandatory={mandatory}
            hasError={hasError}
          />
        </div>
        <Popover
          isOpen={popoverOpen}
          onClose={() => setPopoverOpen(false)}
          title={displayValue || label}
          anchorRef={anchorRef as React.RefObject<HTMLElement>}
        >
          {popoverContent}
        </Popover>
      </FieldWrapper>
    );
  }

  // Date kinds: 'datetime' | 'date' | 'time'
  const isDateKind = kind === 'datetime' || kind === 'date' || kind === 'time';
  if (isDateKind) {
    const dateMode = mode ?? (kind as 'datetime' | 'date' | 'time');

    let inputValue: string;
    if (dateMode === 'datetime') inputValue = snToInputDatetime(value);
    else if (dateMode === 'date') inputValue = snToInputDate(value);
    else inputValue = snToInputTime(value);

    if (readOnly) {
      let displayText: string;
      if (dateMode === 'datetime') displayText = formatDatetimeReadOnly(value);
      else if (dateMode === 'date') displayText = formatDateReadOnly(value);
      else displayText = formatTimeReadOnly(value);

      const readOnlyStyle: React.CSSProperties = {
        display: 'block',
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSizeBase,
        color: theme.colorText,
        lineHeight: theme.lineHeightBase,
        minHeight: theme.inputHeight,
        padding: `0 ${theme.inputPaddingHorizontal}`,
        alignContent: 'center',
      };

      return (
        <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
          <span id={name} style={readOnlyStyle}>{displayText}</span>
        </FieldWrapper>
      );
    }

    const inputType = dateMode === 'datetime' ? 'datetime-local' : dateMode;

    const inputStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      height: theme.inputHeight,
      padding: `0 ${theme.inputPaddingHorizontal}`,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSizeBase,
      color: theme.colorText,
      backgroundColor: theme.inputBackgroundColor,
      border: `${theme.borderWidth} solid ${theme.colorBorder}`,
      borderRadius: theme.borderRadius,
      boxSizing: 'border-box',
      outline: 'none',
      transition: `border-color ${theme.transitionSpeed}`,
    };

    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>): void {
      const raw = e.target.value;
      let snValue: string;
      if (dateMode === 'datetime') snValue = inputDatetimeToSn(raw);
      else if (dateMode === 'date') snValue = inputDateToSn(raw);
      else snValue = inputTimeToSn(raw);
      onChange(name, snValue, snValue);
    }

    return (
      <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
        <input
          id={name}
          type={inputType}
          value={inputValue}
          onChange={handleDateChange}
          required={mandatory}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colorBorderFocus;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.colorBorder;
          }}
        />
      </FieldWrapper>
    );
  }

  // Unreachable — resolveKind always returns a valid kind — but satisfies TypeScript
  return (
    <FieldWrapper name={name} label={label} mandatory={mandatory} hasError={hasError} style={style} className={className}>
      <TextInput
        id={name}
        value={value}
        onChange={(v) => onChange(name, v, v)}
        readOnly={readOnly}
        mandatory={mandatory}
        maxLength={maxLength}
        hasError={hasError}
      />
    </FieldWrapper>
  );
}
