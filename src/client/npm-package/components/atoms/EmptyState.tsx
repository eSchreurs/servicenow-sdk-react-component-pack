import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from './Icon';
import { Text } from './Text';

interface EmptyStateProps {
  message: string;
  style?: React.CSSProperties;
  className?: string;
}

export function EmptyState({ message, style, className }: EmptyStateProps): React.ReactElement {
  const theme = useTheme();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacingXl,
    gap: theme.spacingSm,
    ...style,
  };

  return (
    <div style={containerStyle} className={className}>
      <Icon name="info" size={48} color={theme.colorTextMuted} />
      <Text variant="caption">{message}</Text>
    </div>
  );
}
