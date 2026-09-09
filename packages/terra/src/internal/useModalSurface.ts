import React, { useEffect, useRef, useState } from 'react';
import { useOverlayLayer } from '../providers/OverlayProvider';
import { getExitDelay } from '../utils/motion';
import { FOCUSABLE_SELECTOR } from '../utils/dom';

export interface UseModalSurfaceOptions {
  open: boolean;
  onClose?: (() => void) | undefined;
  closeOnBackdrop: boolean;
  exitDurationMs: number;
}

export interface UseModalSurfaceResult {
  root: HTMLElement | null;
  visible: boolean;
  closing: boolean;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onBackdropMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onPanelKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function useModalSurface({
  open,
  onClose,
  closeOnBackdrop,
  exitDurationMs,
}: UseModalSurfaceOptions): UseModalSurfaceResult {
  const { root } = useOverlayLayer({
    open,
    ...(onClose ? { onClose } : {}),
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const [renderState, setRenderState] = useState<'open' | 'closing' | 'closed'>(
    open ? 'open' : 'closed'
  );

  useEffect(() => {
    if (open) {
      setRenderState('open');
      return;
    }
    setRenderState((prev) => (prev === 'closed' ? 'closed' : 'closing'));
  }, [open]);

  useEffect(() => {
    if (renderState !== 'closing') return;
    const timeout = setTimeout(
      () => setRenderState('closed'),
      getExitDelay(exitDurationMs)
    );
    return () => clearTimeout(timeout);
  }, [renderState, exitDurationMs]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? panel).focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  const onBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || active === panel) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || active === panel) {
      event.preventDefault();
      first.focus();
    }
  };

  return {
    root,
    visible: renderState !== 'closed',
    closing: renderState === 'closing',
    panelRef,
    onBackdropMouseDown,
    onPanelKeyDown,
  };
}
