import { Text } from '../../../atoms/Text';
import { Radio } from '../../../atoms/Radio';
import { Button } from '../../../atoms/Button';
import { ButtonIsland } from '../../../molecules/ButtonIsland';
import { FlexContainer } from '../../../layout/FlexContainer';
import type { SettingsChoiceField, SettingsFieldValue } from '../types';

interface ChoiceFieldProps {
  categoryId: string;
  field: SettingsChoiceField;
  value: SettingsFieldValue | undefined;
  onChange: (value: SettingsFieldValue) => void;
}

export function ChoiceField({
  categoryId,
  field,
  value,
  onChange,
}: ChoiceFieldProps) {
  const legend = (
    <legend style={{ padding: 0, marginBottom: 'var(--stella-space-1)' }}>
      <Text as="span" variant="body-strong">
        {field.label}
      </Text>
    </legend>
  );
  const description = field.description && (
    <Text
      as="p"
      variant="caption"
      color="secondary"
      style={{ marginBottom: 'var(--stella-space-3)' }}
    >
      {field.description}
    </Text>
  );

  if (field.control === 'segmented') {
    return (
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        {legend}
        {description}
        <ButtonIsland size="sm">
          {field.options.map((option) => (
            <Button
              key={option.value}
              size="sm"
              active={value === option.value}
              aria-pressed={value === option.value}
              leadingIcon={option.icon}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </ButtonIsland>
      </fieldset>
    );
  }

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      {legend}
      {description}
      <FlexContainer direction="column" gap="2">
        {field.options.map((option) => (
          <Radio
            key={option.value}
            name={`${categoryId}-${field.key}`}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
        ))}
      </FlexContainer>
    </fieldset>
  );
}
