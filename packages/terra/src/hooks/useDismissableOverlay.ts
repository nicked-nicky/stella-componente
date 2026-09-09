import React, { useCallback, useEffect, useRef } from 'react';
import { useOverlayLayer } from '../providers/OverlayProvider';
import { useAnchorPosition } from './useAnchorPosition';
import type { Anchor, Placement } from './useAnchorPosition';
import { useClickOutside } from './useClickOutside';
import { FOCUSABLE_SELECTOR } from '../utils/dom';

export interface UseDismissableOverlayOptions {
  open: boolean;
  onClose?: (() => void) | undefined;
  anchor: Anchor | null;
  placement?: Placement;
  offset?: number;
  padding?: number;
  initialFocusSelector?: string;
}

export interface UseDismissableOverlayResult {
  root: HTMLElement | null;
  panelRef: (node: HTMLDivElement | null) => void;
  panel: HTMLDivElement | null;
  style: React.CSSProperties;
  placement: Placement;
  requestClose: (restoreFocus: boolean) => void;
}

export function useDismissableOverlay({
  open,
  onClose,
  anchor,
  placement = 'bottom-start',
  offset = 8,
  padding = 8,
  initialFocusSelector = FOCUSABLE_SELECTOR,
}: UseDismissableOverlayOptions): UseDismissableOverlayResult {
  const restoreFocus = useRef(true);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const requestClose = useCallback(
    (restore: boolean) => {
      restoreFocus.current = restore;
      onClose?.();
    },
    [onClose]
  );
  const handleEscapeClose = useCallback(
    () => requestClose(true),
    [requestClose]
  );
  const handleOutsideClose = useCallback(
    () => requestClose(false),
    [requestClose]
  );

  const { root } = useOverlayLayer({ open, onClose: handleEscapeClose });
  const {
    panelRef,
    panel,
    style,
    placement: resolvedPlacement,
  } = useAnchorPosition({
    open,
    anchor,
    placement,
    offset,
    padding,
  });

  useClickOutside(
    [panel, anchor instanceof HTMLElement ? anchor : null],
    handleOutsideClose,
    open
  );

  useEffect(() => {
    if (!open || !panel) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    restoreFocus.current = true;
    const raf = requestAnimationFrame(() => {
      const first = panel.querySelector<HTMLElement>(initialFocusSelector);
      (first ?? panel).focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      if (restoreFocus.current) previouslyFocused.current?.focus?.();
    };
  }, [open, panel]);

  return {
    root,
    panelRef,
    panel,
    style,
    placement: resolvedPlacement,
    requestClose,
  };
}
