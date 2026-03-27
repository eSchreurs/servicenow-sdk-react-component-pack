import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CheckboxProps {
  id: string;
  value: boolean;
  onChange: (value: boolean) => void;
  indeterminate?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Checkbox({
  id,
  value,
  onChange,
  indeterminate = false,
  style,
  className,
}: CheckboxProps): React.ReactElement {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // indeterminate is a DOM property — not a React attribute — so it must be set via a ref
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    height: theme.inputHeight,
    ...style,
  };

  const checkboxStyle: React.CSSProperties = {
    width: '1rem',
    height: '1rem',
    cursor: 'pointer',
    accentColor: theme.colorPrimary,
  };

  return (
    <div style={containerStyle} className={className}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={checkboxStyle}
      />
    </div>
  );
}
