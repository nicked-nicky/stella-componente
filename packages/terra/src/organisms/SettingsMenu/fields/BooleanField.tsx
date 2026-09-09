import { Text } from '../../../atoms/Text';
import { Switch } from '../../../atoms/Switch';
import { FlexContainer } from '../../../layout/FlexContainer';
import type { SettingsBooleanField, SettingsFieldValue } from '../types';

interface BooleanFieldProps {
  field: SettingsBooleanField;
  fieldId: string;
  value: SettingsFieldValue | undefined;
  onChange: (value: SettingsFieldValue) => void;
}

export function BooleanField({
  field,
  fieldId,
  value,
  onChange,
}: BooleanFieldProps) {
  return (
    <FlexContainer justify="between" align="center" gap="4">
      <label htmlFor={fieldId} style={{ cursor: 'pointer' }}>
        <Text as="span" variant="body-strong">
          {field.label}
        </Text>
        {field.description && (
          <Text
            as="p"
            variant="caption"
            color="secondary"
            style={{ marginTop: 'var(--stella-space-1)' }}
          >
            {field.description}
          </Text>
        )}
      </label>
      <Switch
        id={fieldId}
        checked={Boolean(value)}
        onCheckedChange={onChange}
      />
    </FlexContainer>
  );
}
