import { PaletteIcon, SunIcon, MoonIcon, MonitorIcon } from '../../utils/icons';
import type {
  ColorScheme,
  RadiusStyle,
  Density,
  BorderWidthStyle,
  MotionStyle,
  ThemeConfig,
} from '../../theme/ThemeManager';
import type { SettingsCategory, SettingsFieldValue } from './types';

export const appearanceSettingsCategory: SettingsCategory = {
  id: 'appearance',
  label: 'Appearance',
  icon: <PaletteIcon />,
  description:
    'Backed by ThemeManager — these fields change the real theme live, no local state involved.',
  fields: [
    {
      key: 'colorScheme',
      type: 'choice',
      control: 'segmented',
      label: 'Color scheme',
      options: [
        { value: 'light', label: 'Light', icon: <SunIcon /> },
        { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
        { value: 'system', label: 'System', icon: <MonitorIcon /> },
      ],
    },
    {
      key: 'radius',
      type: 'choice',
      control: 'segmented',
      label: 'Rounding',
      description:
        'Scales every corner radius token together — sharp (0.5×), default (1×), round (1.5×).',
      options: [
        { value: 'sharp', label: 'Sharp' },
        { value: 'default', label: 'Default' },
        { value: 'round', label: 'Round' },
      ],
    },
    {
      key: 'density',
      type: 'choice',
      control: 'segmented',
      label: 'Density',
      description: 'Scales every spacing/padding token together.',
      options: [
        { value: 'compact', label: 'Compact' },
        { value: 'default', label: 'Default' },
        { value: 'comfortable', label: 'Comfortable' },
      ],
    },
    {
      key: 'borderWidth',
      type: 'choice',
      control: 'segmented',
      label: 'Border thickness',
      description:
        'Sets --stella-border-width directly — every hairline in Terra reads this one token. None is a genuine borderless mode, not just a thinner one.',
      options: [
        { value: 'none', label: 'None' },
        { value: 'thin', label: 'Thin' },
        { value: 'default', label: 'Default' },
        { value: 'thick', label: 'Thick' },
      ],
    },
    {
      key: 'motion',
      type: 'choice',
      control: 'segmented',
      label: 'Motion',
      description:
        "System defers to your OS's reduce-motion setting. Reduced forces near-zero durations regardless of OS setting. Off removes every animation/transition outright — Spinner keeps spinning either way, so loading states never look hung.",
      options: [
        { value: 'system', label: 'System' },
        { value: 'reduced', label: 'Reduced' },
        { value: 'off', label: 'Off' },
      ],
    },
  ],
};

export type AppearanceSettingsValues = Omit<ThemeConfig, 'version'>;

export function getAppearanceValues(
  config: ThemeConfig
): AppearanceSettingsValues {
  const { version: _version, ...values } = config;
  return values;
}

export interface AppearanceThemeControls {
  setColorScheme: (colorScheme: ColorScheme) => void;
  setRadius: (radius: RadiusStyle) => void;
  setDensity: (density: Density) => void;
  setBorderWidth: (borderWidth: BorderWidthStyle) => void;
  setMotion: (motion: MotionStyle) => void;
}

export function applyAppearanceChange(
  theme: AppearanceThemeControls,
  key: string,
  value: SettingsFieldValue
): void {
  switch (key) {
    case 'colorScheme':
      theme.setColorScheme(value as ColorScheme);
      break;
    case 'radius':
      theme.setRadius(value as RadiusStyle);
      break;
    case 'density':
      theme.setDensity(value as Density);
      break;
    case 'borderWidth':
      theme.setBorderWidth(value as BorderWidthStyle);
      break;
    case 'motion':
      theme.setMotion(value as MotionStyle);
      break;
  }
}
