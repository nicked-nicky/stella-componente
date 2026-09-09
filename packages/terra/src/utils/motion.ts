export function getExitDelay(defaultMs: number): number {
  if (typeof window === 'undefined' || !window.matchMedia) return defaultMs;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : defaultMs;
}
