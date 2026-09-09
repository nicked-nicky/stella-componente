import React, { forwardRef } from 'react';
import styles from './Kbd.module.css';
import type { Grade } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  grade?: Grade;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ grade: gradeProp, className, children, ...props }, ref) => {
    const grade = resolveGrade(gradeProp, 'default');

    return (
      <kbd
        data-stella-grade={grade}
        ref={ref}
        className={cx(styles.kbd, className)}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = 'Kbd';

export type { KbdProps };
