import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ThemeManager } from '../../theme/ThemeManager';
import type {
  ThemeConfig,
  ColorScheme,
  RadiusStyle,
  Density,
  BorderWidthStyle,
  MotionStyle,
} from '../../theme/ThemeManager';

interface ThemeContextValue {
  config: ThemeConfig;
  setColorScheme: (colorScheme: ColorScheme) => void;
  setRadius: (radius: RadiusStyle) => void;
  setDensity: (density: Density) => void;
  setBorderWidth: (borderWidth: BorderWidthStyle) => void;
  setMotion: (motion: MotionStyle) => void;
  getConfig: () => ThemeConfig;
  loadConfig: (config: Partial<ThemeConfig>) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultConfig?: Partial<ThemeConfig>;
  onChange?: (config: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultConfig,
  onChange,
}: ThemeProviderProps) {
  const managerRef = useRef<ThemeManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new ThemeManager(
      document.documentElement,
      defaultConfig
    );
  }

  const [config, setConfig] = useState<ThemeConfig>(() =>
    managerRef.current!.getConfig()
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const unsubscribe = managerRef.current!.subscribe((next) => {
      setConfig(next);
      onChangeRef.current?.(next);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      config,
      setColorScheme: (colorScheme) =>
        managerRef.current!.setColorScheme(colorScheme),
      setRadius: (radius) => managerRef.current!.setRadius(radius),
      setDensity: (density) => managerRef.current!.setDensity(density),
      setBorderWidth: (borderWidth) =>
        managerRef.current!.setBorderWidth(borderWidth),
      setMotion: (motion) => managerRef.current!.setMotion(motion),
      getConfig: () => managerRef.current!.getConfig(),
      loadConfig: (c) => managerRef.current!.loadConfig(c),
    }),
    [config]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return ctx;
}
