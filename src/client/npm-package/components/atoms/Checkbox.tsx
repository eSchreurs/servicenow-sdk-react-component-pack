import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CheckboxProps {
  id: string;
  value: boolean;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
  hasError?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Checkbox({
  id,
  value,
  onChange,
  readOnly = false,
  hasError = false,
  style,
  className,
}: CheckboxProps): React.ReactElement {
  const theme = useTheme();

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    height: theme.inputHeight,
    outline: hasError ? `${theme.borderWidth} solid ${theme.colorDanger}` : 'none',
    borderRadius: theme.borderRadiusSm,
    ...style,
  };

  const checkboxStyle: React.CSSProperties = {
    width: '1rem',
    height: '1rem',
    cursor: readOnly ? 'default' : 'pointer',
    accentColor: theme.colorPrimary,
  };

  return (
    <div style={containerStyle} className={className}>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={readOnly}
        style={checkboxStyle}
      />
    </div>
  );
}
