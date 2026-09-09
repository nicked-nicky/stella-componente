import type { ReactNode } from 'react';

export type SettingsFieldType = 'text' | 'boolean' | 'choice';

interface SettingsFieldBase {
  key: string;
  label: string;
  description?: string;
}

export interface SettingsTextField extends SettingsFieldBase {
  type: 'text';
  placeholder?: string;
}

export interface SettingsBooleanField extends SettingsFieldBase {
  type: 'boolean';
}

export interface SettingsChoiceOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface SettingsChoiceField extends SettingsFieldBase {
  type: 'choice';
  options: SettingsChoiceOption[];
  control?: 'radio' | 'segmented';
}

export type SettingsField =
  SettingsTextField | SettingsBooleanField | SettingsChoiceField;

export interface SettingsCategory {
  id: string;
  label: string;
  /**
   * Rendered as the nav button's leading icon, so pass a raw icon node rather
   * than one already wrapped in `<Icon>` — the button sizes it for you.
   */
  icon?: ReactNode;
  description?: string;
  fields: SettingsField[];
}

export interface SettingsSchema {
  categories: SettingsCategory[];
}

export type SettingsFieldValue = string | boolean;

export type SettingsValues = Record<string, Record<string, SettingsFieldValue>>;
