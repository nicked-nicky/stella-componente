import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useOverlayLayer } from '../../providers/OverlayProvider';
import { useAnchorPosition } from '../../hooks';
import type { Placement } from '../../hooks';
import { mergeRefs } from '../../utils/mergeRefs';
import { Island } from '../../atoms/Island';
import styles from './Tooltip.module.css';
import { cx } from '../../utils/cx';

export interface TooltipProps {
  children: React.ReactElement;
  label: React.ReactNode;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
}

function composeHandlers<E>(
  original: ((event: E) => void) | undefined,
  added: (event: E) => void
) {
  return (event: E) => {
    original?.(event);
    added(event);
  };
}

export function Tooltip({
  children,
  label,
  placement = 'top',
  delay = 400,
  disabled = false,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const tooltipId = useId();

  const handleClose = useCallback(() => setOpen(false), []);
  const { root } = useOverlayLayer({ open, onClose: handleClose });
  const { panelRef, style } = useAnchorPosition({
    open,
    anchor: anchorRef.current,
    placement,
    offset: 6,
  });

  const show = useCallback(() => {
    if (disabled) return;
    clearTimeout(showTimer.current);
    showTimer.current = setTimeout(() => setOpen(true), delay);
  }, [disabled, delay]);

  const hide = useCallback(() => {
    clearTimeout(showTimer.current);
    setOpen(false);
  }, []);

  useEffect(() => () => clearTimeout(showTimer.current), []);

  if (!isValidElement(children)) return children;

  const child = children as React.ReactElement<Record<string, unknown>> & {
    ref?: React.Ref<HTMLElement>;
  };
  const childProps = child.props as Record<string, unknown>;

  const childRef =
    Number.parseInt(React.version, 10) >= 19
      ? (childProps.ref as React.Ref<HTMLElement> | undefined)
      : child.ref;

  const trigger = cloneElement(child, {
    ref: mergeRefs(anchorRef, childRef),
    onMouseEnter: composeHandlers(
      childProps.onMouseEnter as (e: React.MouseEvent) => void,
      show
    ),
    onMouseLeave: composeHandlers(
      childProps.onMouseLeave as (e: React.MouseEvent) => void,
      hide
    ),
    onFocus: composeHandlers(
      childProps.onFocus as (e: React.FocusEvent) => void,
      show
    ),
    onBlur: composeHandlers(
      childProps.onBlur as (e: React.FocusEvent) => void,
      hide
    ),
    'aria-describedby': open
      ? cx(childProps['aria-describedby'] as string | undefined, tooltipId)
      : childProps['aria-describedby'],
  });

  return (
    <>
      {trigger}
      {open &&
        root &&
        createPortal(
          <Island
            ref={panelRef}
            shape="pill"
            grade="global"
            id={tooltipId}
            role="tooltip"
            className={styles.tooltip}
            style={style}
          >
            {label}
          </Island>,
          root
        )}
    </>
  );
}

Tooltip.displayName = 'Tooltip';
