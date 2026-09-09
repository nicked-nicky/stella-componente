import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './List.module.css';
import type { Grade } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

const OPTION_SELECTOR = '[role="option"]:not([aria-disabled="true"])';
const TYPEAHEAD_RESET_MS = 500;

export interface ListProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  grade?: Grade;

  value?: string;

  defaultValue?: string;

  onValueChange?: (value: string) => void;

  'aria-label'?: string;

  children?: React.ReactNode;
}

export interface ListItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  value: string;

  disabled?: boolean;

  leadingIcon?: React.ReactNode;

  trailing?: React.ReactNode;

  description?: React.ReactNode;

  children?: React.ReactNode;
}

interface ListContextValue {
  selectedValue: string | undefined;
  select: (value: string) => void;
}

const ListContext = createContext<ListContextValue | undefined>(undefined);

function useListContext(): ListContextValue {
  const ctx = useContext(ListContext);
  if (!ctx) {
    throw new Error('List subcomponents must be used inside <List>.');
  }
  return ctx;
}

function ListBase({
  grade: gradeProp,
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  onKeyDown,
  ...props
}: ListProps) {
  const grade = resolveGrade(gradeProp, 'default');
  const listRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef<{
    buffer: string;
    timer: ReturnType<typeof setTimeout> | undefined;
  }>({ buffer: '', timer: undefined });

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = isControlled ? value : internalValue;

  const select = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const contextValue = useMemo<ListContextValue>(
    () => ({ selectedValue, select }),
    [selectedValue, isControlled, onValueChange]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(
      list.querySelectorAll<HTMLElement>(OPTION_SELECTOR)
    );
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(currentIndex + 1 + items.length) % items.length]?.focus();
        return;
      case 'ArrowUp':
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        return;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        return;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        return;
      case 'Enter':
      case ' ': {
        const active = items[currentIndex];
        if (!active) return;
        event.preventDefault();
        active.click();
        return;
      }
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const state = typeahead.current;
          clearTimeout(state.timer);
          state.buffer += event.key.toLowerCase();
          const match = items.find((item) =>
            item.textContent?.trim().toLowerCase().startsWith(state.buffer)
          );
          match?.focus();
          state.timer = setTimeout(() => {
            state.buffer = '';
          }, TYPEAHEAD_RESET_MS);
        }
    }
  };

  return (
    <ListContext.Provider value={contextValue}>
      <div
        ref={listRef}
        role="listbox"
        data-stella-component="list"
        data-stella-grade={grade}
        className={cx(styles.list, className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </ListContext.Provider>
  );
}

ListBase.displayName = 'List';

function ListItem({
  value,
  disabled = false,
  leadingIcon,
  trailing,
  description,
  className,
  children,
  onClick,
  ...props
}: ListItemProps) {
  const { selectedValue, select } = useListContext();
  const selected = selectedValue === value;

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      tabIndex={selected ? 0 : -1}
      data-selected={selected || undefined}
      className={cx(styles.item, disabled && styles.disabled, className)}
      onClick={(event) => {
        onClick?.(event);
        if (disabled) return;
        select(value);
      }}
      {...props}
    >
      {leadingIcon && (
        <span className={styles.icon} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span className={styles.content}>
        <span className={styles.label}>{children}</span>
        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </div>
  );
}

ListItem.displayName = 'List.Item';

type ListComponent = typeof ListBase & {
  Item: typeof ListItem;
};

const List = ListBase as ListComponent;
List.Item = ListItem;

export { List };
