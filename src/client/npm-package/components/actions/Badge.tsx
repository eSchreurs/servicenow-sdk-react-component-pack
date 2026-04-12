import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  style?: React.CSSProperties;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  style,
  className,
}: BadgeProps): React.ReactElement {
  const theme = useTheme();

  // Colors for each variant: [background, text, border]
  const variantColors: Record<NonNullable<BadgeProps['variant']>, [string, string, string]> = {
    default: [theme.colorBackgroundMuted, theme.colorTextMuted, theme.colorBorder],
    primary: [theme.colorPrimaryBackground, theme.colorPrimary, theme.colorPrimaryBorder],
    success: [theme.colorSuccessBackground, theme.colorSuccess, theme.colorSuccessBorder],
    warning: [theme.colorWarningBackground, theme.colorWarning, theme.colorWarningBorder],
    danger: [theme.colorDangerBackground, theme.colorDanger, theme.colorDangerBorder],
  };

  const [bgColor, textColor, borderColor] = variantColors[variant];

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: theme.fontSizeSmall,
    fontFamily: theme.fontFamily,
    fontWeight: theme.fontWeightMedium,
    lineHeight: 1,
    padding: `0.2rem ${theme.spacingSm}`,
    borderRadius: theme.borderRadiusLg,
    backgroundColor: bgColor,
    color: textColor,
    border: `${theme.borderWidth} solid ${borderColor}`,
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <span style={badgeStyle} className={className}>
      {children}
    </span>
  );
}
