import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface TextInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  mandatory?: boolean;
  maxLength?: number;
  placeholder?: string;
  inputType?: string;
  hasError?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function TextInput({
  id,
  value,
  onChange,
  readOnly = false,
  mandatory,
  maxLength,
  placeholder,
  inputType = 'text',
  hasError = false,
  style,
  className,
}: TextInputProps): React.ReactElement {
  const theme = useTheme();

  if (readOnly) {
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
    return <span id={id} style={readOnlyStyle} className={className}>{value}</span>;
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: theme.inputHeight,
    padding: `0 ${theme.inputPaddingHorizontal}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    color: theme.colorText,
    backgroundColor: theme.inputBackgroundColor,
    border: `${theme.borderWidth} solid ${hasError ? theme.colorDanger : theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    boxSizing: 'border-box',
    outline: 'none',
    transition: `border-color ${theme.transitionSpeed}`,
    ...style,
  };

  return (
    <input
      id={id}
      type={inputType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      placeholder={placeholder}
      required={mandatory}
      style={inputStyle}
      className={className}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = theme.colorBorderFocus;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = hasError ? theme.colorDanger : theme.colorBorder;
      }}
    />
  );
}
