import { Button } from '../../atoms/Button';
import { ButtonIsland } from '../../molecules/ButtonIsland';
import { ScrollArea } from '../../layout/ScrollArea';
import type { Grade } from '../../types/types';
import type { SettingsCategory } from './types';
import styles from './SettingsMenu.module.css';

interface SettingsNavProps {
  categories: SettingsCategory[];
  activeId: string | undefined;
  onSelect: (id: string) => void;
  grade?: Grade;
}

export function SettingsNav({
  categories,
  activeId,
  onSelect,
  grade,
}: SettingsNavProps) {
  return (
    <ScrollArea
      as="nav"
      aria-label="Settings categories"
      className={styles.nav}
    >
      <ButtonIsland
        orientation="vertical"
        size="md"
        {...(grade ? { parentGrade: grade } : {})}
      >
        {categories.map((category) => (
          <Button
            key={category.id}
            active={category.id === activeId}
            leadingIcon={category.icon}
            aria-current={category.id === activeId ? 'true' : undefined}
            onClick={() => onSelect(category.id)}
          >
            {category.label}
          </Button>
        ))}
      </ButtonIsland>
    </ScrollArea>
  );
}

SettingsNav.displayName = 'SettingsMenu.Nav';
