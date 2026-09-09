import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { computeAnchoredPosition } from '../utils/positioning';
import type { Anchor, Placement } from '../utils/positioning';

export type { Anchor, VirtualAnchor, Placement } from '../utils/positioning';
export { pointAnchor } from '../utils/positioning';

export interface UseAnchorPositionOptions {
  open: boolean;
  anchor: Anchor | null;
  placement?: Placement;
  offset?: number;
  padding?: number;
}

export interface UseAnchorPositionResult {
  panelRef: (node: HTMLDivElement | null) => void;
  panel: HTMLDivElement | null;
  style: React.CSSProperties;
  placement: Placement;
}

export function useAnchorPosition({
  open,
  anchor,
  placement = 'bottom-start',
  offset = 8,
  padding = 8,
}: UseAnchorPositionOptions): UseAnchorPositionResult {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const panelElementRef = useRef<HTMLDivElement | null>(null);
  const setPanelRef = useCallback((node: HTMLDivElement | null) => {
    panelElementRef.current = node;
    setPanel(node);
  }, []);

  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const [resolvedPlacement, setResolvedPlacement] =
    useState<Placement>(placement);

  const recompute = useCallback(() => {
    const panel = panelElementRef.current;
    if (!anchor || !panel) return;
    const anchorRect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const result = computeAnchoredPosition({
      anchorRect,
      panelWidth: panelRect.width,
      panelHeight: panelRect.height,
      placement,
      offset,
      padding,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    setCoords({ top: result.top, left: result.left });
    setResolvedPlacement(result.placement);
  }, [anchor, placement, offset, padding]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    recompute();
  }, [open, panel, recompute]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', recompute, true);
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute, true);
      window.removeEventListener('resize', recompute);
    };
  }, [open, recompute]);

  useEffect(() => {
    if (!open || !panel || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(recompute);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [open, panel, recompute]);

  const style: React.CSSProperties = coords
    ? { position: 'fixed', top: coords.top, left: coords.left }
    : { position: 'fixed', top: 0, left: 0, visibility: 'hidden' };

  return { panelRef: setPanelRef, panel, style, placement: resolvedPlacement };
}
