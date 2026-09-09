import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface OverlayContextValue {
  root: HTMLElement | null;
  register: () => string;
  unregister: (id: string) => void;
  isTopmost: (id: string) => boolean;
}

const OverlayContext = createContext<OverlayContextValue | undefined>(
  undefined
);

let layerCounter = 0;

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [stack, setStack] = useState<string[]>([]);

  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('data-stella-overlay-root', '');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    setRoot(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  const register = useCallback(() => {
    const id = `stella-overlay-${++layerCounter}`;
    setStack((prev) => [...prev, id]);
    return id;
  }, []);

  const unregister = useCallback((id: string) => {
    setStack((prev) => prev.filter((layerId) => layerId !== id));
  }, []);

  const isTopmost = useCallback(
    (id: string) => stack.length > 0 && stack[stack.length - 1] === id,
    [stack]
  );

  return (
    <OverlayContext.Provider value={{ root, register, unregister, isTopmost }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlayContext() {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    throw new Error(
      'useOverlayContext (and anything built on it, like useOverlayLayer) must be used within an <OverlayProvider>.'
    );
  }
  return ctx;
}
