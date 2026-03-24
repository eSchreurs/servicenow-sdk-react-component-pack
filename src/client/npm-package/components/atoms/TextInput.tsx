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
  style,
  className,
}: TextInputProps): React.ReactElement {
  const theme = useTheme();

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
    ...style,
  };

  return (
    <input
      id={id}
      type={inputType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      maxLength={maxLength}
      placeholder={placeholder}
      required={mandatory}
      style={inputStyle}
      className={className}
    />
  );
}
