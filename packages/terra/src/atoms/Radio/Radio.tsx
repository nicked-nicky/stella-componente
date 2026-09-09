import React, { forwardRef } from 'react';
import styles from './Radio.module.css';
import type { Grade, SizeSM } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type RadioSize = SizeSM;

interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  size?: RadioSize;
  grade?: Grade;
  label?: React.ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    { size = 'md', grade: gradeProp, label, className, id, onChange, ...props },
    ref
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    const autoId = React.useId();
    const inputId = id ?? autoId;

    const input = (
      <span
        data-stella-grade={grade}
        className={[styles.wrapper, styles[`size-${size}`]].join(' ')}
      >
        <input
          ref={ref}
          type="radio"
          id={inputId}
          className={cx(styles.input, className)}
          onChange={onChange}
          {...props}
        />
        <span className={styles.dot} aria-hidden="true" />
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

Radio.displayName = 'Radio';

export type { RadioProps, RadioSize };
