import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface TextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'body' | 'caption' | 'label';
  style?: React.CSSProperties;
  className?: string;
}

export function Text({ children, variant = 'body', style, className }: TextProps): React.ReactElement {
  const theme = useTheme();

  const variantStyles: Record<string, React.CSSProperties> = {
    heading: {
      fontSize: theme.fontSizeLarge,
      fontWeight: theme.fontWeightBold,
      lineHeight: theme.lineHeightBase,
      color: theme.colorText,
    },
    body: {
      fontSize: theme.fontSizeBase,
      fontWeight: theme.fontWeightNormal,
      lineHeight: theme.lineHeightBase,
      color: theme.colorText,
    },
    caption: {
      fontSize: theme.fontSizeSmall,
      fontWeight: theme.fontWeightNormal,
      lineHeight: theme.lineHeightBase,
      color: theme.colorTextMuted,
    },
    label: {
      fontSize: theme.fontSizeBase,
      fontWeight: theme.fontWeightMedium,
      lineHeight: theme.lineHeightBase,
      color: theme.colorText,
    },
  };

  const baseStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily,
    margin: 0,
    padding: 0,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <span style={baseStyle} className={className}>
      {children}
    </span>
  );
}
