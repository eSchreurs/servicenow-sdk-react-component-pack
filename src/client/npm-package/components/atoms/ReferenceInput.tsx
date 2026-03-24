import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from './Icon';

export interface ReferenceSearchColumn {
  field: string;
  value: string;
}

export interface ReferenceResult {
  sysId: string;
  displayValue: string;
  columns: ReferenceSearchColumn[];
}

interface ReferenceInputProps {
  id: string;
  value: string;
  displayValue: string;
  onChange: (value: string, displayValue: string) => void;
  onSearchTermChange: (term: string) => void;
  onClear: () => void;
  onInfoClick?: () => void;
  searchResults: ReferenceResult[];
  isSearching: boolean;
  searchError?: string;
  readOnly?: boolean;
  mandatory?: boolean;
  hasError?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function ReferenceInput({
  id,
  value,
  displayValue,
  onChange,
  onSearchTermChange,
  onClear,
  onInfoClick,
  searchResults,
  isSearching,
  searchError,
  readOnly = false,
  mandatory,
  hasError = false,
  placeholder = 'Type to search...',
  style,
  className,
}: ReferenceInputProps): React.ReactElement {
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSelected = value !== '';
  const showDropdown = isOpen && !isSelected && (isSearching || searchResults.length > 0 || !!searchError || (inputText.length >= 2 && !isSearching));

  // Close dropdown on click outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  // Measure and flip dropdown if insufficient space below
  useEffect(() => {
    if (!showDropdown || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setFlipUp(spaceBelow < 220);
  }, [showDropdown]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setInputText(term);
    setIsOpen(true);
    onSearchTermChange(term);
  }, [onSearchTermChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, []);

  const handleSelectResult = useCallback((result: ReferenceResult) => {
    onChange(result.sysId, result.displayValue);
    setInputText('');
    setIsOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onClear();
    setInputText('');
    setIsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onClear]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    ...style,
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height: theme.inputHeight,
    backgroundColor: isSelected ? theme.colorBackgroundMuted : theme.inputBackgroundColor,
    border: `${theme.borderWidth} solid ${hasError ? theme.colorDanger : theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    transition: `border-color ${theme.transitionSpeed}`,
  };

  const textStyle: React.CSSProperties = {
    flex: 1,
    padding: `0 ${theme.spacingSm}`,
    fontSize: theme.fontSizeBase,
    color: isSelected ? theme.colorText : theme.colorText,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: theme.fontFamily,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const iconButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `0 ${theme.spacingSm}`,
    height: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme.colorTextMuted,
    flexShrink: 0,
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.colorBackground,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    boxShadow: theme.shadowMd,
    maxHeight: '200px',
    overflowY: 'auto',
    ...(flipUp
      ? { bottom: '100%', marginBottom: theme.spacingXs }
      : { top: '100%', marginTop: theme.spacingXs }),
  };

  const resultRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: `${theme.spacingSm} ${theme.inputPaddingHorizontal}`,
    cursor: 'pointer',
    gap: theme.spacingSm,
    borderBottom: `${theme.borderWidth} solid ${theme.colorBackgroundMuted}`,
  };

  const primaryColStyle: React.CSSProperties = {
    flex: '0 0 auto',
    fontWeight: theme.fontWeightMedium,
    color: theme.colorText,
    fontSize: theme.fontSizeBase,
    minWidth: '8rem',
  };

  const secondaryColStyle: React.CSSProperties = {
    flex: 1,
    color: theme.colorTextMuted,
    fontSize: theme.fontSizeSmall,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const statusRowStyle: React.CSSProperties = {
    padding: `${theme.spacingSm} ${theme.inputPaddingHorizontal}`,
    color: theme.colorTextMuted,
    fontSize: theme.fontSizeSmall,
  };

  // Read-only render
  if (readOnly) {
    const readOnlyRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      height: theme.inputHeight,
      gap: theme.spacingXs,
    };
    const readOnlyTextStyle: React.CSSProperties = {
      flex: 1,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSizeBase,
      color: theme.colorText,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
    return (
      <div style={{ ...containerStyle }} className={className}>
        <div style={readOnlyRowStyle}>
          <span style={readOnlyTextStyle}>{displayValue}</span>
          {isSelected && onInfoClick && (
            <button
              type="button"
              style={iconButtonStyle}
              onClick={onInfoClick}
              aria-label="View record info"
            >
              <Icon name="info" size={theme.iconSizeDefault} color={theme.colorTextMuted} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      <div
        style={inputRowStyle}
        onFocus={() => {
          if (containerRef.current) {
            const border = containerRef.current.querySelector('div') as HTMLDivElement | null;
            if (border) border.style.borderColor = theme.colorBorderFocus;
          }
        }}
      >
        {/* Pen icon (left) — only in selected state */}
        {isSelected && (
          <button
            type="button"
            style={iconButtonStyle}
            onClick={handleClear}
            aria-label="Clear selection"
          >
            <Icon name="edit" size={theme.iconSizeDefault} color={theme.colorTextMuted} />
          </button>
        )}

        {/* Main input / display */}
        {isSelected ? (
          <span
            style={{
              ...textStyle,
              flex: 1,
              display: 'block',
              lineHeight: theme.inputHeight,
            }}
          >
            {displayValue}
          </span>
        ) : (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputText.length >= 2) setIsOpen(true);
            }}
            placeholder={placeholder}
            required={mandatory}
            style={textStyle}
            autoComplete="off"
          />
        )}

        {/* Info icon (right) — when value is present */}
        {isSelected && onInfoClick && (
          <button
            type="button"
            style={iconButtonStyle}
            onClick={onInfoClick}
            aria-label="View record info"
          >
            <Icon name="info" size={theme.iconSizeDefault} color={theme.colorTextMuted} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef} style={dropdownStyle}>
          {isSearching && (
            <div style={statusRowStyle}>Searching...</div>
          )}
          {!isSearching && searchError && (
            <div style={{ ...statusRowStyle, color: theme.colorDanger }}>{searchError}</div>
          )}
          {!isSearching && !searchError && searchResults.length === 0 && inputText.length >= 2 && (
            <div style={statusRowStyle}>No results found</div>
          )}
          {!isSearching && !searchError && searchResults.map((result) => (
            <div
              key={result.sysId}
              style={resultRowStyle}
              onMouseDown={(e) => {
                // Prevent blur from closing dropdown before click registers
                e.preventDefault();
                handleSelectResult(result);
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = theme.colorBackgroundMuted;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
              }}
            >
              <span style={primaryColStyle}>{result.displayValue}</span>
              {result.columns.slice(1).map((col) => (
                <span key={col.field} style={secondaryColStyle}>{col.value}</span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
