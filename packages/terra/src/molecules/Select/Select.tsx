import React, {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
} from 'react';
import { Menu } from '../../organisms/Menu';
import { ChevronDownIcon } from '../../utils/icons';
import type { Grade, SizeSML } from '../../types/types';
import styles from './Select.module.css';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type SelectSize = SizeSML;

export interface SelectOptionProps {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface SelectProps {
  value?: string;

  defaultValue?: string;

  onValueChange?: (value: string) => void;

  placeholder?: React.ReactNode;

  grade?: Grade;

  size?: SelectSize;

  error?: boolean;

  disabled?: boolean;

  label?: React.ReactNode;

  id?: string;

  'aria-label'?: string;

  className?: string;

  fullWidth?: boolean;

  children?: React.ReactNode;
}

function SelectOption(_props: SelectOptionProps): React.ReactElement | null {
  return null;
}

SelectOption.displayName = 'Select.Option';

function SelectBase({
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  grade: gradeProp,
  size = 'md',
  error = false,
  disabled = false,
  label,
  id,
  className,
  fullWidth = true,
  children,
  ...props
}: SelectProps) {
  const grade = resolveGrade(gradeProp, 'default');
  const [open, setOpen] = useState(false);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const autoId = useId();
  const triggerId = label ? (id ?? autoId) : id;

  const options = Children.toArray(children).filter(
    (child): child is React.ReactElement<SelectOptionProps> =>
      isValidElement(child) && child.type === SelectOption
  );
  const selected = options.find(
    (option) => option.props.value === currentValue
  );

  const commit = (nextValue: string) => {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const trigger = (
    <button
      data-stella-grade={grade}
      ref={triggerRef}
      type="button"
      id={triggerId}
      disabled={disabled}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-invalid={error || undefined}
      className={cx(
        styles.trigger,
        styles[`size-${size}`],
        fullWidth && styles.fullWidth,
        error && styles.error,
        disabled && styles.disabled,
        className
      )}
      onClick={() => setOpen((prev) => !prev)}
      onKeyDown={handleTriggerKeyDown}
      {...props}
    >
      <span className={styles.value}>
        {selected ? (
          selected.props.children
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
      </span>
      <span className={styles.chevron} aria-hidden="true">
        <ChevronDownIcon />
      </span>
    </button>
  );

  return (
    <>
      {label ? (
        <span className={styles.field}>
          <label htmlFor={triggerId} className={styles.fieldLabel}>
            {label}
          </label>
          {trigger}
        </span>
      ) : (
        trigger
      )}
      <Menu
        open={open}
        onClose={() => setOpen(false)}
        anchor={triggerRef.current}
      >
        {options.map((option) => (
          <Menu.Item
            key={option.props.value}
            active={option.props.value === currentValue}
            disabled={option.props.disabled}
            onSelect={() => commit(option.props.value)}
          >
            {option.props.children}
          </Menu.Item>
        ))}
      </Menu>
    </>
  );
}

SelectBase.displayName = 'Select';

type SelectComponent = typeof SelectBase & {
  Option: typeof SelectOption;
};

const Select = SelectBase as SelectComponent;
Select.Option = SelectOption;

export { Select };
export type { SelectSize };
