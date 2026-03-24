import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  style?: React.CSSProperties;
  className?: string;
}

const ARROW_SIZE = 6;

function getPositionStyles(position: NonNullable<TooltipProps['position']>): React.CSSProperties {
  switch (position) {
    case 'top':
      return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: `${ARROW_SIZE}px` };
    case 'bottom':
      return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: `${ARROW_SIZE}px` };
    case 'left':
      return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: `${ARROW_SIZE}px` };
    case 'right':
      return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: `${ARROW_SIZE}px` };
  }
}

function getArrowStyles(
  position: NonNullable<TooltipProps['position']>,
  bgColor: string
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    border: `${ARROW_SIZE}px solid transparent`,
  };

  switch (position) {
    case 'top':
      return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', borderTopColor: bgColor, borderBottom: 'none' };
    case 'bottom':
      return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderBottomColor: bgColor, borderTop: 'none' };
    case 'left':
      return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', borderLeftColor: bgColor, borderRight: 'none' };
    case 'right':
      return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', borderRightColor: bgColor, borderLeft: 'none' };
  }
}

export function Tooltip({
  content,
  children,
  position = 'top',
  style,
  className,
}: TooltipProps): React.ReactElement {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 9999,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    backgroundColor: theme.colorTooltipBackground,
    color: theme.colorTooltipText,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeSmall,
    fontWeight: theme.fontWeightNormal,
    lineHeight: theme.lineHeightBase,
    padding: `${theme.spacingXs} ${theme.spacingSm}`,
    borderRadius: theme.borderRadiusSm,
    boxShadow: theme.shadowSm,
    transition: `opacity ${theme.transitionSpeed}`,
    visibility: visible ? 'visible' : 'hidden',
    opacity: visible ? 1 : 0,
    ...getPositionStyles(position),
    ...style,
  };

  return (
    <div
      style={wrapperStyle}
      className={className}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <div role="tooltip" style={contentStyle}>
        {content}
        <span style={getArrowStyles(position, theme.colorTooltipBackground)} aria-hidden="true" />
      </div>
    </div>
  );
}
