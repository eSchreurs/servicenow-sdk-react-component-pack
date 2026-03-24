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
  hasError?: boolean;
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
  hasError = false,
  style,
  className,
}: TextAreaProps): React.ReactElement {
  const theme = useTheme();

  if (readOnly) {
    const readOnlyStyle: React.CSSProperties = {
      display: 'block',
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSizeBase,
      color: theme.colorText,
      lineHeight: theme.lineHeightBase,
      whiteSpace: 'pre-wrap',
      ...style,
    };
    return <span id={id} style={readOnlyStyle} className={className}>{value}</span>;
  }

  const textAreaStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: `${theme.spacingSm} ${theme.inputPaddingHorizontal}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    color: theme.colorText,
    backgroundColor: theme.inputBackgroundColor,
    border: `${theme.borderWidth} solid ${hasError ? theme.colorDanger : theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    lineHeight: theme.lineHeightBase,
    transition: `border-color ${theme.transitionSpeed}`,
    ...style,
  };

  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      placeholder={placeholder}
      rows={rows}
      required={mandatory}
      style={textAreaStyle}
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
