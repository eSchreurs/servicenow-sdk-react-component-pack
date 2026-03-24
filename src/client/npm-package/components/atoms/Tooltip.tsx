import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Inject keyframe and tooltip CSS once on module load
const TOOLTIP_STYLE_ID = 'snk-tooltip-styles';
if (typeof document !== 'undefined' && !document.getElementById(TOOLTIP_STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = TOOLTIP_STYLE_ID;
  styleEl.textContent = `
    .snk-tooltip-content {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity 150ms;
      position: absolute;
      z-index: 9999;
      white-space: nowrap;
    }
    .snk-tooltip-wrapper:hover .snk-tooltip-content {
      visibility: visible;
      opacity: 1;
    }
  `;
  document.head.appendChild(styleEl);
}

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

  const tooltipBg = '#1f2937';
  const tooltipText = '#f9fafb';

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: tooltipBg,
    color: tooltipText,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeSmall,
    fontWeight: theme.fontWeightNormal,
    lineHeight: theme.lineHeightBase,
    padding: `${theme.spacingXs} ${theme.spacingSm}`,
    borderRadius: theme.borderRadiusSm,
    boxShadow: theme.shadowSm,
    ...getPositionStyles(position),
    ...style,
  };

  return (
    <div
      style={wrapperStyle}
      className={['snk-tooltip-wrapper', className].filter(Boolean).join(' ')}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <div
        role="tooltip"
        className="snk-tooltip-content"
        style={{
          ...contentStyle,
          visibility: visible ? 'visible' : 'hidden',
          opacity: visible ? 1 : 0,
        }}
      >
        {content}
        <span style={getArrowStyles(position, tooltipBg)} aria-hidden="true" />
      </div>
    </div>
  );
}
