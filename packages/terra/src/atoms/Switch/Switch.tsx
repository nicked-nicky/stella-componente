import React, { forwardRef, useState } from 'react';
import styles from './Switch.module.css';
import type { Grade, SizeSM } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type SwitchSize = SizeSM;

interface SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value'
> {
  size?: SwitchSize;

  checked?: boolean;

  defaultChecked?: boolean;

  onCheckedChange?: (checked: boolean) => void;

  grade?: Grade;

  label?: React.ReactNode;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      size = 'md',
      checked,
      defaultChecked = false,
      onCheckedChange,
      grade: gradeProp,
      label,
      disabled,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    const autoId = React.useId();
    const switchId = label ? (id ?? autoId) : id;
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? checked : internalChecked;

    const handleClick = () => {
      if (disabled) return;
      const next = !isChecked;
      if (!isControlled) setInternalChecked(next);
      onCheckedChange?.(next);
    };

    const control = (
      <button
        data-stella-grade={grade}
        ref={ref}
        type="button"
        role="switch"
        id={switchId}
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleClick}
        className={cx(
          styles.switch,
          styles[`size-${size}`],
          isChecked && styles.checked,
          className
        )}
        {...props}
      >
        <span className={styles.thumb} />
      </button>
    );

    if (!label) return control;

    return (
      <label className={styles.label} htmlFor={switchId}>
        {control}
        <span className={styles.labelText}>{label}</span>
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export type { SwitchProps, SwitchSize };
