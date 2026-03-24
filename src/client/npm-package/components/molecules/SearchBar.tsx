import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  style?: React.CSSProperties;
  className?: string;
}

const DEFAULT_DEBOUNCE_MS = 300;

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  style,
  className,
}: SearchBarProps): React.ReactElement {
  const theme = useTheme();

  // Internal input state (immediate, before debounce)
  const [internalValue, setInternalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes into internal state (e.g. cleared by parent)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = useCallback((v: string) => {
    setInternalValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(v);
    }, debounceMs);
  }, [onChange, debounceMs]);

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInternalValue('');
    onChange('');
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    ...style,
  };

  const searchIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: theme.inputPaddingHorizontal,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: theme.colorTextMuted,
    display: 'flex',
    alignItems: 'center',
  };

  const clearButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: theme.inputPaddingHorizontal,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    color: theme.colorTextMuted,
  };

  // Padding to accommodate icons inside the input
  const inputStyle: React.CSSProperties = {
    paddingLeft: `calc(${theme.inputPaddingHorizontal} + ${theme.iconSizeDefault}px + ${theme.spacingSm})`,
    paddingRight: internalValue
      ? `calc(${theme.inputPaddingHorizontal} + ${theme.iconSizeDefault}px + ${theme.spacingSm})`
      : theme.inputPaddingHorizontal,
  };

  return (
    <div style={containerStyle} className={className}>
      <span style={searchIconStyle}>
        <Icon name="search" size={theme.iconSizeDefault} color={theme.colorTextMuted} />
      </span>
      <Input
        id="search-bar"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={inputStyle}
      />
      {internalValue && (
        <button
          type="button"
          style={clearButtonStyle}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <Icon name="clear" size={theme.iconSizeDefault} color={theme.colorTextMuted} />
        </button>
      )}
    </div>
  );
}
