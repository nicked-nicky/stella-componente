import React, { Children, cloneElement, isValidElement, useState } from 'react';
import type { Grade } from '../../types/types';
import styles from './CheckboxGroup.module.css';
import { cx } from '../../utils/cx';

type CheckboxGroupOrientation = 'vertical' | 'horizontal';

export interface CheckboxGroupProps {
  legend?: React.ReactNode;

  value?: string[];

  defaultValue?: string[];

  onValueChange?: (value: string[]) => void;

  orientation?: CheckboxGroupOrientation;

  disabled?: boolean;

  grade?: Grade;

  className?: string;

  children?: React.ReactNode;
}

interface InjectableCheckboxProps {
  value?: string | number | readonly string[];
  checked?: boolean;
  disabled?: boolean;
  grade?: Grade;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CheckboxGroup({
  legend,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  disabled = false,
  grade,
  className,
  children,
}: CheckboxGroupProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(
    defaultValue ?? []
  );
  const currentValue = isControlled ? value : internalValue;

  const handleToggle = (itemValue: string, checked: boolean) => {
    const next = checked
      ? [...currentValue, itemValue]
      : currentValue.filter((entry) => entry !== itemValue);
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const items = Children.map(children, (child) => {
    if (!isValidElement<InjectableCheckboxProps>(child)) return child;
    const childValue = String(child.props.value ?? '');
    const childGrade = child.props.grade ?? grade;
    return cloneElement(child, {
      checked: currentValue.includes(childValue),
      disabled: disabled || Boolean(child.props.disabled),
      ...(childGrade ? { grade: childGrade } : {}),
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        child.props.onChange?.(event);
        handleToggle(childValue, event.target.checked);
      },
    });
  });

  return (
    <fieldset
      className={cx(styles.group, disabled && styles.disabled, className)}
      disabled={disabled}
    >
      {legend && <legend className={styles.legend}>{legend}</legend>}
      <div className={cx(styles.items, styles[orientation])}>{items}</div>
    </fieldset>
  );
}

CheckboxGroup.displayName = 'CheckboxGroup';

export type { CheckboxGroupOrientation };
