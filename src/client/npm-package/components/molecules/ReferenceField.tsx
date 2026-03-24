import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FieldWrapper } from '../atoms/FieldWrapper';
import { ReferenceInput } from '../atoms/ReferenceInput';
import { Popover } from '../atoms/Popover';
import * as SearchService from '../../services/SearchService';
import * as RecordService from '../../services/RecordService';
import * as RhinoService from '../../services/RhinoService';
import { BaseFieldProps, ReferenceSearchResult, ServiceNowRecord, FieldData } from '../../types/index';

export interface ReferenceFieldProps extends BaseFieldProps {
  reference: string;
  referenceQual?: string;
  filter?: string;
  searchFields?: string[];
  previewFields?: string[];
  table: string;
  sysId: string;
}

// Humanise a field name: replace underscores with spaces, title-case each word.
function humanise(fieldName: string): string {
  return fieldName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Build the effective filter to pass to SearchService.
// referenceQual and developer filter are ANDed together.
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

export function ReferenceField({
  name,
  label,
  value,
  displayValue,
  mandatory,
  readOnly,
  hasError,
  reference,
  referenceQual,
  filter,
  searchFields,
  previewFields,
  onChange,
  style,
  className,
}: ReferenceFieldProps): React.ReactElement {
  const theme = useTheme();

  // Search state
  const [searchResults, setSearchResults] = useState<ReferenceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>(undefined);

  // Popover state
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverRows, setPopoverRows] = useState<PopoverRow[]>([]);
  const [popoverLoading, setPopoverLoading] = useState(false);
  const [popoverError, setPopoverError] = useState<string | undefined>(undefined);

  // Stale-result protection: each search has a generation number.
  // Only the latest generation's result is applied.
  const searchGenRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Popover anchor: attach to the wrapping div
  const anchorRef = useRef<HTMLDivElement>(null);

  // When filter changes: cancel in-flight search, clear results.
  // Selected value is NOT auto-cleared per spec.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchGenRef.current += 1;
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(undefined);
  }, [filter]);

  const handleSearchTermChange = useCallback((term: string) => {
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
          reference,
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
  }, [reference, referenceQual, filter, searchFields]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = useCallback((sysId: string, dv: string) => {
    // Cancel any in-flight search now that a value is selected
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchGenRef.current += 1;
    setSearchResults([]);
    setIsSearching(false);
    onChange(name, sysId, dv);
  }, [name, onChange]);

  const handleClear = useCallback(() => {
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
        // With previewFields: fetch record values + labels from RhinoService
        const [record, metadata] = await Promise.all([
          RecordService.getRecord(reference, value, previewFields),
          RhinoService.getRecordMetadata(reference, previewFields),
        ]);
        const rows: PopoverRow[] = previewFields.map((field) => {
          const fieldMeta: FieldData | undefined = metadata[field];
          const fieldLabel = fieldMeta ? fieldMeta.label : humanise(field);
          const fieldValue = record[field] ? record[field].displayValue : '';
          return { label: fieldLabel, displayValue: fieldValue };
        });
        setPopoverRows(rows);
      } else {
        // Without previewFields: fetch all fields, show non-sys_ fields with a value
        const record: ServiceNowRecord = await RecordService.getRecord(reference, value);
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

  // Popover content
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
    <FieldWrapper
      name={name}
      label={label}
      mandatory={mandatory}
      hasError={hasError}
      style={style}
      className={className}
    >
      <div ref={anchorRef}>
        <ReferenceInput
          id={name}
          value={value}
          displayValue={displayValue}
          onChange={handleChange}
          onSearchTermChange={handleSearchTermChange}
          onClear={handleClear}
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
