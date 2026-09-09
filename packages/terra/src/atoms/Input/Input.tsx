import React, { forwardRef } from 'react';
import styles from './Input.module.css';
import type { Grade, SizeSML } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type InputSize = SizeSML;

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  grade?: Grade;

  size?: InputSize;

  error?: boolean;

  leadingIcon?: React.ReactNode;

  trailingIcon?: React.ReactNode;

  /**
   * Trailing slot for interactive/live content (a clear button, a loading
   * spinner with its own role="status", etc). Unlike trailingIcon, this is
   * never wrapped in aria-hidden — that would hide a real control (or a
   * status announcement) from assistive tech, which is only correct for a
   * purely decorative glyph.
   */
  trailingAction?: React.ReactNode;

  label?: React.ReactNode;

  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      grade: gradeProp,
      size = 'md',
      error = false,
      leadingIcon,
      trailingIcon,
      trailingAction,
      label,
      disabled,
      id,
      className,
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    const autoId = React.useId();
    const inputId = label ? (id ?? autoId) : id;

    const field = (
      <span
        data-stella-grade={grade}
        className={cx(
          styles.wrapper,
          styles[`size-${size}`],
          fullWidth && styles.fullWidth,
          error && styles.error,
          disabled && styles.disabled
        )}
      >
        {leadingIcon && (
          <span className={styles.icon} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cx(styles.input, className)}
          {...props}
        />
        {trailingIcon && (
          <span className={styles.icon} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
        {trailingAction && (
          <span className={styles.icon}>{trailingAction}</span>
        )}
      </span>
    );

    if (!label) return field;

    return (
      <span className={styles.field}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          {label}
        </label>
        {field}
      </span>
    );
  }
);

Input.displayName = 'Input';

export type { InputProps, InputSize };
