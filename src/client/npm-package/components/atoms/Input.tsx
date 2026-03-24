import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface InputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function Input({
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  style,
  className,
}: InputProps): React.ReactElement {
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
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      className={className}
    />
  );
}
