import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface DropdownProps {
  id: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function Dropdown({
  id,
  value,
  options,
  onChange,
  placeholder,
  style,
  className,
}: DropdownProps): React.ReactElement {
  const theme = useTheme();

  const selectStyle: React.CSSProperties = {
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
    cursor: 'pointer',
    ...style,
  };

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectStyle}
      className={className}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
