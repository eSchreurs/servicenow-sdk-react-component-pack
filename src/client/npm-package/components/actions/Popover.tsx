import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../../context/ThemeContext';

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement>;
  style?: React.CSSProperties;
  className?: string;
}

const POPOVER_WIDTH = 320;
const POPOVER_MIN_HEIGHT = 80;
const OFFSET = 8;

export function Popover({
  isOpen,
  onClose,
  title,
  children,
  anchorRef,
  style,
  className,
}: PopoverProps): React.ReactElement | null {
  const theme = useTheme();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  // openUpward = true means the popover renders above the anchor (default).
  // Flips to false (downward) only when there is insufficient space above.
  const [openUpward, setOpenUpward] = useState(true);

  const calculatePosition = useCallback(() => {
    if (!anchorRef.current) return;

    const anchor = anchorRef.current;
    const anchorRect = anchor.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    const spaceAbove = anchorRect.top;
    const spaceBelow = window.innerHeight - anchorRect.bottom;

    // Default: open above. Flip downward only when space above is insufficient
    // and there is more room below.
    const shouldOpenDownward =
      spaceAbove < POPOVER_MIN_HEIGHT + OFFSET && spaceBelow > spaceAbove;

    setOpenUpward(!shouldOpenDownward);

    const top = shouldOpenDownward
      ? anchorRect.bottom + scrollY + OFFSET          // top of popover at anchor bottom
      : anchorRect.top + scrollY - OFFSET;            // bottom of popover at anchor top (via transform)

    // Align to left edge of anchor; clamp so it stays on-screen
    const leftRaw = anchorRect.left + scrollX;
    const maxLeft = document.documentElement.clientWidth - POPOVER_WIDTH - OFFSET;
    const left = Math.max(OFFSET, Math.min(leftRaw, maxLeft));

    setPosition({ top, left });
  }, [anchorRef]);

  // Recalculate position on open, scroll, and resize
  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);
    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen, calculatePosition]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !position) return null;

  const popoverStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    // When opening upward, shift the element up by its own height so its
    // bottom edge sits at the anchor's top edge. Using transform avoids
    // any dependency on viewport height or scroll position.
    transform: openUpward ? 'translateY(-100%)' : undefined,
    width: POPOVER_WIDTH,
    backgroundColor: theme.colorBackground,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    boxShadow: theme.shadowMd,
    zIndex: 10000,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    color: theme.colorText,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacingSm} ${theme.spacingMd}`,
    borderBottom: title ? `${theme.borderWidth} solid ${theme.colorBorder}` : undefined,
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: theme.fontWeightMedium,
    fontSize: theme.fontSizeBase,
    color: theme.colorText,
    margin: 0,
    flexGrow: 1,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme.colorTextMuted,
    fontSize: theme.fontSizeLarge,
    lineHeight: 1,
    padding: `0 ${theme.spacingXs}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadiusSm,
    transition: `color ${theme.transitionSpeed}`,
  };

  const bodyStyle: React.CSSProperties = {
    padding: theme.spacingMd,
    overflowY: 'auto',
    maxHeight: '60vh',
  };

  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;

  return ReactDOM.createPortal(
    <div
      ref={popoverRef}
      style={popoverStyle}
      className={className}
      role="dialog"
      aria-modal="false"
      aria-label={title}
    >
      <div style={headerStyle}>
        {title && <span style={titleStyle}>{title}</span>}
        <button
          type="button"
          style={closeButtonStyle}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div style={bodyStyle}>
        {children}
      </div>
    </div>,
    portalTarget
  );
}
