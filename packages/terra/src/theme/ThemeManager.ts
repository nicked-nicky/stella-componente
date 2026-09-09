export type ColorScheme = 'light' | 'dark' | 'system';

export type RadiusStyle = 'sharp' | 'default' | 'round';

export type Density = 'compact' | 'default' | 'comfortable';

export type BorderWidthStyle = 'none' | 'thin' | 'default' | 'thick';

export type MotionStyle = 'system' | 'reduced' | 'off';

export interface ThemeConfig {
  version: 5;
  colorScheme: ColorScheme;
  radius: RadiusStyle;
  density: Density;
  borderWidth: BorderWidthStyle;
  motion: MotionStyle;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  version: 5,
  colorScheme: 'system',
  radius: 'default',
  density: 'default',
  borderWidth: 'default',
  motion: 'system',
};

type ThemeChangeListener = (config: ThemeConfig) => void;

const RADIUS_SCALE: Record<RadiusStyle, string> = {
  sharp: '0.5',
  default: '1',
  round: '1.5',
};

const DENSITY_SCALE: Record<Density, string> = {
  compact: '0.85',
  default: '1',
  comfortable: '1.15',
};

const BORDER_WIDTH: Record<BorderWidthStyle, string> = {
  none: '0px',
  thin: '1px',
  default: '2px',
  thick: '3px',
};

export class ThemeManager {
  private root: HTMLElement;
  private config: ThemeConfig;
  private listeners = new Set<ThemeChangeListener>();

  constructor(
    root: HTMLElement = document.documentElement,
    initial?: Partial<ThemeConfig>
  ) {
    this.root = root;
    this.config = { ...DEFAULT_THEME_CONFIG, ...initial };
    this.applyColorScheme(this.config.colorScheme);
    this.applyRadius(this.config.radius);
    this.applyDensity(this.config.density);
    this.applyBorderWidth(this.config.borderWidth);
    this.applyMotion(this.config.motion);
  }

  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  setColorScheme(colorScheme: ColorScheme): void {
    this.config = { ...this.config, colorScheme };
    this.applyColorScheme(colorScheme);
    this.notify();
  }

  setRadius(radius: RadiusStyle): void {
    this.config = { ...this.config, radius };
    this.applyRadius(radius);
    this.notify();
  }

  setDensity(density: Density): void {
    this.config = { ...this.config, density };
    this.applyDensity(density);
    this.notify();
  }

  setBorderWidth(borderWidth: BorderWidthStyle): void {
    this.config = { ...this.config, borderWidth };
    this.applyBorderWidth(borderWidth);
    this.notify();
  }

  setMotion(motion: MotionStyle): void {
    this.config = { ...this.config, motion };
    this.applyMotion(motion);
    this.notify();
  }

  loadConfig(config: Partial<ThemeConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      version: DEFAULT_THEME_CONFIG.version,
    };
    this.applyColorScheme(this.config.colorScheme);
    this.applyRadius(this.config.radius);
    this.applyDensity(this.config.density);
    this.applyBorderWidth(this.config.borderWidth);
    this.applyMotion(this.config.motion);
    this.notify();
  }

  subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.getConfig();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private applyColorScheme(colorScheme: ColorScheme): void {
    if (colorScheme === 'system') {
      this.root.removeAttribute('data-theme');
    } else {
      this.root.setAttribute('data-theme', colorScheme);
    }
  }

  private applyRadius(radius: RadiusStyle): void {
    this.root.style.setProperty('--stella-radius-scale', RADIUS_SCALE[radius]);
  }

  private applyDensity(density: Density): void {
    this.root.style.setProperty('--stella-space-scale', DENSITY_SCALE[density]);
  }

  private applyBorderWidth(borderWidth: BorderWidthStyle): void {
    this.root.style.setProperty(
      '--stella-border-width',
      BORDER_WIDTH[borderWidth]
    );
  }

  private applyMotion(motion: MotionStyle): void {
    if (motion === 'system') {
      this.root.removeAttribute('data-stella-motion');
    } else {
      this.root.setAttribute('data-stella-motion', motion);
    }
  }
}
