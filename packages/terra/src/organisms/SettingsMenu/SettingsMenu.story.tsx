import { SettingsMenu } from './SettingsMenu';
import type { SettingsSchema } from './types';

const schema: SettingsSchema = {
  categories: [
    {
      id: 'general',
      label: 'General',
      fields: [
        { key: 'name', type: 'text', label: 'Display name' },
        { key: 'autosave', type: 'boolean', label: 'Auto-save' },
      ],
    },
    {
      id: 'appearance',
      label: 'Appearance',
      fields: [
        {
          key: 'theme',
          type: 'choice',
          label: 'Theme',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ],
        },
      ],
    },
  ],
};

const values = {
  general: { name: 'Nick', autosave: true },
  appearance: { theme: 'dark' },
};

export function SettingsMenuFixture() {
  return (
    <div style={{ height: 400 }}>
      <SettingsMenu schema={schema} values={values} onChange={() => {}} />
    </div>
  );
}
