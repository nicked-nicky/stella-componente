import React from 'react';
import { createPortal } from 'react-dom';
import { useDismissableOverlay } from '../../hooks';
import type { Anchor, Placement } from '../../hooks';
import { Island } from '../../atoms/Island';
import styles from './Popover.module.css';
import { cx } from '../../utils/cx';

export interface PopoverProps {
  open: boolean;
  onClose?: () => void;
  anchor: Anchor | null;
  placement?: Placement;
  offset?: number;
  minWidth?: number | string;
  className?: string;
  children?: React.ReactNode;
}

export function Popover({
  open,
  onClose,
  anchor,
  placement = 'bottom-start',
  offset = 8,
  minWidth,
  className,
  children,
}: PopoverProps) {
  const { root, panelRef, style } = useDismissableOverlay({
    open,
    onClose,
    anchor,
    placement,
    offset,
  });

  if (!open || !root) return null;

  return createPortal(
    <div ref={panelRef} style={style}>
      <Island
        shape="panel"
        grade="global"
        floating
        tabIndex={-1}
        role="dialog"
        className={cx(styles.panel, className)}
        {...(minWidth !== undefined ? { style: { minWidth } } : {})}
      >
        {children}
      </Island>
    </div>,
    root
  );
}

Popover.displayName = 'Popover';
