import { Fragment } from 'react';
import { Text } from '../../atoms/Text';
import { Divider } from '../../atoms/Divider';
import { FlexContainer } from '../../layout/FlexContainer';
import { SettingsFieldRow } from './fields/SettingsFieldRow';
import type { SettingsCategory, SettingsFieldValue } from './types';
import type { Grade } from '../../types/types';
import styles from './SettingsMenu.module.css';

interface SettingsCategoryPanelProps {
  category: SettingsCategory;
  grade: Grade;
  values: Record<string, SettingsFieldValue>;
  onFieldChange: (key: string, value: SettingsFieldValue) => void;
}

export function SettingsCategoryPanel({
  category,
  grade,
  values,
  onFieldChange,
}: SettingsCategoryPanelProps) {
  return (
    <div>
      <Text
        variant="title-2"
        as="h2"
        style={{ marginBottom: 'var(--stella-space-1)' }}
      >
        {category.label}
      </Text>
      {category.description && (
        <Text
          variant="body"
          color="secondary"
          as="p"
          style={{ marginBottom: 'var(--stella-space-6)' }}
        >
          {category.description}
        </Text>
      )}
      {!category.description && (
        <div style={{ marginBottom: 'var(--stella-space-4)' }} />
      )}

      <FlexContainer direction="column" gap="0">
        {category.fields.map((field, idx) => (
          <Fragment key={field.key}>
            <div className={styles.fieldRow} data-stella-grade={grade}>
              <SettingsFieldRow
                categoryId={category.id}
                field={field}
                value={values[field.key]}
                onChange={(value) => onFieldChange(field.key, value)}
              />
            </div>
            {idx < category.fields.length - 1 && (
              <Divider className={styles.rowDivider} />
            )}
          </Fragment>
        ))}
      </FlexContainer>
    </div>
  );
}

SettingsCategoryPanel.displayName = 'SettingsMenu.CategoryPanel';
