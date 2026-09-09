import React, { forwardRef } from 'react';
import styles from './Divider.module.css';
import type { Grade } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type DividerOrientation = 'horizontal' | 'vertical';

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  grade?: Grade;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    { orientation = 'horizontal', grade: gradeProp, className, ...props },
    ref
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    return (
      <div
        ref={ref}
        data-stella-grade={grade}
        role="separator"
        aria-orientation={orientation}
        className={cx(styles.divider, styles[orientation], className)}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export type { DividerProps, DividerOrientation };
