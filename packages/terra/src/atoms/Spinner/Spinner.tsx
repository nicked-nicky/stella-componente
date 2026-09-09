import React, { forwardRef } from 'react';
import styles from './Spinner.module.css';
import type { SizeXSL } from '../../types/types';
import { cx } from '../../utils/cx';

type SpinnerSize = SizeXSL;

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cx(styles.spinner, styles[`size-${size}`], className)}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

export type { SpinnerProps, SpinnerSize };
