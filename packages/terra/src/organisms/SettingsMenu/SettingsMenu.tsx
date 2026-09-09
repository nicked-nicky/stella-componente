import { useState } from 'react';
import { FlexContainer } from '../../layout/FlexContainer';
import { ScrollArea } from '../../layout/ScrollArea';
import { SettingsNav } from './SettingsNav';
import { SettingsCategoryPanel } from './SettingsCategoryPanel';
import type {
  SettingsSchema,
  SettingsValues,
  SettingsFieldValue,
} from './types';
import styles from './SettingsMenu.module.css';
import { resolveGrade } from '../../internal/grade';
import type { Grade } from '../../types/types';

type SettingsMenuGrade = Grade;

interface SettingsMenuProps {
  grade?: SettingsMenuGrade;

  schema: SettingsSchema;
  values: SettingsValues;
  onChange: (
    categoryId: string,
    fieldKey: string,
    value: SettingsFieldValue
  ) => void;
  selectedCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  defaultCategoryId?: string;
}

export function SettingsMenu({
  grade: gradeProp,
  schema,
  values,
  onChange,
  selectedCategoryId,
  onCategoryChange,
  defaultCategoryId,
}: SettingsMenuProps) {
  const grade = resolveGrade(gradeProp, 'default');

  const [internalSelected, setInternalSelected] = useState(
    defaultCategoryId ?? schema.categories[0]?.id
  );
  const isControlled = selectedCategoryId !== undefined;
  const activeId = isControlled ? selectedCategoryId : internalSelected;

  const handleSelect = (id: string) => {
    if (!isControlled) setInternalSelected(id);
    onCategoryChange?.(id);
  };

  const activeCategory =
    schema.categories.find((c) => c.id === activeId) ?? schema.categories[0];

  return (
    <FlexContainer
      align="stretch"
      className={styles.root}
      data-stella-grade={grade}
    >
      <SettingsNav
        categories={schema.categories}
        activeId={activeId}
        onSelect={handleSelect}
        grade={grade}
      />
      <ScrollArea grow padding="6">
        {activeCategory && (
          <SettingsCategoryPanel
            category={activeCategory}
            grade={grade}
            values={values[activeCategory.id] ?? {}}
            onFieldChange={(key, value) =>
              onChange(activeCategory.id, key, value)
            }
          />
        )}
      </ScrollArea>
    </FlexContainer>
  );
}

SettingsMenu.displayName = 'SettingsMenu';

export type { SettingsMenuProps, SettingsMenuGrade };
