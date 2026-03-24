import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Label } from './Label';

interface FieldWrapperProps {
  name: string;
  label: string;
  mandatory: boolean;
  hasError: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function FieldWrapper({
  name,
  label,
  mandatory,
  hasError,
  children,
  style,
  className,
}: FieldWrapperProps): React.ReactElement {
  const theme = useTheme();

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingXs,
    fontFamily: theme.fontFamily,
    ...style,
  };

  const inputContainerStyle: React.CSSProperties = {
    borderRadius: theme.borderRadius,
    border: hasError
      ? `${theme.borderWidth} solid ${theme.colorDanger}`
      : 'none',
  };

  return (
    <div style={wrapperStyle} className={className}>
      <Label htmlFor={name} mandatory={mandatory}>
        {label}
      </Label>
      <div style={inputContainerStyle}>
        {children}
      </div>
    </div>
  );
}
