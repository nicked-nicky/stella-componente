import { useEffect, useRef } from 'react';
import { useOverlayContext } from './OverlayProvider';

interface UseOverlayLayerOptions {
  open: boolean;
  onClose?: (() => void) | undefined;
  closeOnEscape?: boolean;
}

interface UseOverlayLayerResult {
  root: HTMLElement | null;
  topmost: boolean;
}

export function useOverlayLayer({
  open,
  onClose,
  closeOnEscape = true,
}: UseOverlayLayerOptions): UseOverlayLayerResult {
  const { root, register, unregister, isTopmost } = useOverlayContext();
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = register();
    idRef.current = id;
    return () => {
      unregister(id);
      idRef.current = null;
    };
  }, [open]);

  const topmost = idRef.current !== null && isTopmost(idRef.current);

  useEffect(() => {
    if (!open || !closeOnEscape || !topmost) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, topmost, onClose]);

  return { root, topmost };
}
