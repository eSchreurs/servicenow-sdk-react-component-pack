import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface TextAreaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  mandatory?: boolean;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function TextArea({
  id,
  value,
  onChange,
  readOnly = false,
  mandatory,
  maxLength,
  placeholder,
  rows = 4,
  style,
  className,
}: TextAreaProps): React.ReactElement {
  const theme = useTheme();

  const textAreaStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: `${theme.spacingSm} ${theme.inputPaddingHorizontal}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    color: theme.colorText,
    backgroundColor: theme.inputBackgroundColor,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    lineHeight: theme.lineHeightBase,
    ...style,
  };

  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      maxLength={maxLength}
      placeholder={placeholder}
      rows={rows}
      required={mandatory}
      style={textAreaStyle}
      className={className}
    />
  );
}
