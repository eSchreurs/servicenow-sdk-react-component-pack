import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  readOnly?: boolean;
  mandatory?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function SelectInput({
  id,
  value,
  options,
  onChange,
  readOnly = false,
  mandatory,
  placeholder,
  style,
  className,
}: SelectInputProps): React.ReactElement {
  const theme = useTheme();

  const selectStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: theme.inputHeight,
    padding: `0 ${theme.inputPaddingHorizontal}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    color: value ? theme.colorText : theme.colorTextMuted,
    backgroundColor: theme.inputBackgroundColor,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    boxSizing: 'border-box',
    outline: 'none',
    cursor: readOnly ? 'default' : 'pointer',
    ...style,
  };

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={mandatory}
      disabled={readOnly}
      style={selectStyle}
      className={className}
    >
      {placeholder !== undefined && (
        <option value="">{placeholder}</option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
