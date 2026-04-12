import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// Inject keyframe animation once on module load
const SPINNER_STYLE_ID = 'snk-spinner-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(SPINNER_STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = SPINNER_STYLE_ID;
  styleEl.textContent = '@keyframes snk-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(styleEl);
}

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;   // default: 'md'
  style?: React.CSSProperties;
  className?: string;
}

const SIZE_MAP: Record<SpinnerSize, string> = {
  sm: '1rem',
  md: '1.5rem',
  lg: '2.5rem',
};

const BORDER_WIDTH_MAP: Record<SpinnerSize, string> = {
  sm: '2px',
  md: '2px',
  lg: '3px',
};

export function Spinner({ size = 'md', style, className }: SpinnerProps): React.ReactElement {
  const theme = useTheme();

  const dim = SIZE_MAP[size];
  const borderWidth = BORDER_WIDTH_MAP[size];

  const spinnerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: dim,
    height: dim,
    borderRadius: '50%',
    border: `${borderWidth} solid ${theme.colorBorder}`,
    borderTopColor: theme.colorPrimary,
    animation: 'snk-spin 600ms linear infinite',
    ...style,
  };

  return (
    <div
      style={spinnerStyle}
      className={className}
      role="status"
      aria-label="Loading"
    />
  );
}
