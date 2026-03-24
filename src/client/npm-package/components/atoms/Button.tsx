import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Spinner } from './Spinner';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  style,
  className,
}: ButtonProps): React.ReactElement {
  const theme = useTheme();

  const isDisabled = disabled || loading;

  const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
    sm: {
      fontSize: theme.fontSizeSmall,
      padding: `${theme.spacingXs} ${theme.spacingSm}`,
      height: '1.75rem',
    },
    md: {
      fontSize: theme.fontSizeBase,
      padding: `${theme.spacingSm} ${theme.spacingMd}`,
      height: theme.inputHeight,
    },
    lg: {
      fontSize: theme.fontSizeLarge,
      padding: `${theme.spacingSm} ${theme.spacingLg}`,
      height: '2.75rem',
    },
  };

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
    primary: {
      backgroundColor: isDisabled ? theme.colorBorder : theme.colorPrimary,
      color: theme.colorBackground,
      border: `${theme.borderWidth} solid ${isDisabled ? theme.colorBorder : theme.colorPrimary}`,
    },
    secondary: {
      backgroundColor: theme.colorBackground,
      color: isDisabled ? theme.colorTextMuted : theme.colorText,
      border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: isDisabled ? theme.colorTextMuted : theme.colorPrimary,
      border: `${theme.borderWidth} solid transparent`,
    },
    danger: {
      backgroundColor: isDisabled ? theme.colorBorder : theme.colorDanger,
      color: theme.colorBackground,
      border: `${theme.borderWidth} solid ${isDisabled ? theme.colorBorder : theme.colorDanger}`,
    },
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacingXs,
    fontFamily: theme.fontFamily,
    fontWeight: theme.fontWeightMedium,
    lineHeight: theme.lineHeightBase,
    borderRadius: theme.borderRadius,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.65 : 1,
    transition: `background-color ${theme.transitionSpeed}, border-color ${theme.transitionSpeed}, color ${theme.transitionSpeed}`,
    boxSizing: 'border-box',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  const spinnerSize = size === 'sm' ? 'sm' : 'sm';

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      style={buttonStyle}
      className={className}
      aria-busy={loading}
    >
      {loading && <Spinner size={spinnerSize} />}
      {children}
    </button>
  );
}
