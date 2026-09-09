import React, {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useState,
} from 'react';
import type { Grade } from '../../types/types';
import styles from './RadioGroup.module.css';
import { cx } from '../../utils/cx';

type RadioGroupOrientation = 'vertical' | 'horizontal';

export interface RadioGroupProps {
  legend?: React.ReactNode;

  value?: string;

  defaultValue?: string;

  onValueChange?: (value: string) => void;

  name?: string;

  orientation?: RadioGroupOrientation;

  disabled?: boolean;

  grade?: Grade;

  className?: string;

  children?: React.ReactNode;
}

interface InjectableRadioProps {
  value?: string | number | readonly string[];
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  grade?: Grade;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RadioGroup({
  legend,
  value,
  defaultValue,
  onValueChange,
  name,
  orientation = 'vertical',
  disabled = false,
  grade,
  className,
  children,
}: RadioGroupProps) {
  const autoName = useId();
  const groupName = name ?? autoName;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (nextValue: string) => {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const items = Children.map(children, (child) => {
    if (!isValidElement<InjectableRadioProps>(child)) return child;
    const childValue = String(child.props.value ?? '');
    const childGrade = child.props.grade ?? grade;
    return cloneElement(child, {
      name: groupName,
      checked: currentValue === childValue,
      disabled: disabled || Boolean(child.props.disabled),
      ...(childGrade ? { grade: childGrade } : {}),
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        child.props.onChange?.(event);
        handleChange(childValue);
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

RadioGroup.displayName = 'RadioGroup';

export type { RadioGroupOrientation };
