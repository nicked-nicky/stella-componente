import React, { useEffect, useRef } from 'react';

type OutsideTarget =
  React.RefObject<HTMLElement | null> | HTMLElement | null | undefined;

export function useClickOutside(
  targets: OutsideTarget[],
  onOutside: () => void,
  enabled = true
): void {
  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event: PointerEvent) {
      const node = event.target as Node | null;
      if (!node) return;
      const isInside = targetsRef.current.some((target) => {
        const el = target && 'current' in target ? target.current : target;
        return el?.contains(node) ?? false;
      });
      if (!isInside) onOutsideRef.current();
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [enabled]);
}
