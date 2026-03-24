import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  mandatory?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Label({ htmlFor, children, mandatory = false, style, className }: LabelProps): React.ReactElement {
  const theme = useTheme();

  const labelStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacingXs,
    ...style,
  };

  return (
    <label htmlFor={htmlFor} style={labelStyle} className={className}>
      <Text variant="label">{children}</Text>
      {mandatory && (
        <span style={{ color: theme.colorDanger, fontFamily: theme.fontFamily }}>*</span>
      )}
    </label>
  );
}
