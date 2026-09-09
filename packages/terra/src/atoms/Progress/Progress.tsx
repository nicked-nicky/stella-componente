import React, { forwardRef } from 'react';
import styles from './Progress.module.css';
import type { Grade, SizeSM } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type ProgressSize = SizeSM;

interface ProgressProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role'
> {
  value?: number;
  max?: number;
  size?: ProgressSize;
  grade?: Grade;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    { value, max = 100, size = 'md', grade: gradeProp, className, ...props },
    ref
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    const indeterminate = value === undefined;
    const percent = indeterminate
      ? undefined
      : Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        data-stella-grade={grade}
        className={cx(styles.track, styles[`size-${size}`], className)}
        {...props}
      >
        <div
          className={cx(styles.fill, indeterminate && styles.indeterminate)}
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export type { ProgressProps, ProgressSize };
