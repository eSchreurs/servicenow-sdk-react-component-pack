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
  hasError?: boolean;
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
  hasError = false,
  placeholder,
  style,
  className,
}: SelectInputProps): React.ReactElement {
  const theme = useTheme();

  if (readOnly) {
    const selectedOption = options.find((o) => o.value === value);
    const readOnlyStyle: React.CSSProperties = {
      display: 'block',
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSizeBase,
      color: theme.colorText,
      lineHeight: theme.lineHeightBase,
      minHeight: theme.inputHeight,
      padding: `0 ${theme.inputPaddingHorizontal}`,
      alignContent: 'center',
      ...style,
    };
    return (
      <span id={id} style={readOnlyStyle} className={className}>
        {selectedOption ? selectedOption.label : ''}
      </span>
    );
  }

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
    cursor: 'pointer',
    transition: `border-color ${theme.transitionSpeed}`,
    ...style,
  };

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={mandatory}
      style={selectStyle}
      className={className}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = theme.colorBorderFocus;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = theme.colorBorder;
      }}
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
