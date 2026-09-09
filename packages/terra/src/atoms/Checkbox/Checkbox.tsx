import React, { forwardRef, useEffect, useRef } from 'react';
import { mergeRefs } from '../../utils/mergeRefs';
import styles from './Checkbox.module.css';
import type { Grade, SizeSM } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type CheckboxSize = SizeSM;

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  size?: CheckboxSize;
  grade?: Grade;
  indeterminate?: boolean;
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'md',
      grade: gradeProp,
      indeterminate = false,
      label,
      className,
      id,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    const innerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const setRefs = mergeRefs(innerRef, forwardedRef);

    const autoId = React.useId();
    const inputId = id ?? autoId;

    const input = (
      <span
        data-stella-grade={grade}
        className={[styles.wrapper, styles[`size-${size}`]].join(' ')}
      >
        <input
          ref={setRefs}
          type="checkbox"
          id={inputId}
          className={cx(styles.input, className)}
          onChange={onChange}
          {...props}
        />
        <span className={styles.box} aria-hidden="true">
          <svg
            className={styles.checkIcon}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            className={styles.indeterminateIcon}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 8H12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </span>
    );

    if (!label) return input;

    return (
      <label className={styles.label} htmlFor={inputId}>
        {input}
        <span className={styles.labelText}>{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export type { CheckboxProps, CheckboxSize };
