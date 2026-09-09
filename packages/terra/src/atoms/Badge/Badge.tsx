import React, { forwardRef } from 'react';
import styles from './Badge.module.css';
import { cx } from '../../utils/cx';

type BadgeVariant = 'filled' | 'tinted' | 'outline';
type BadgeColor =
  'neutral' | 'success' | 'info' | 'warning' | 'error' | 'debug';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;

  color?: BadgeColor;

  children?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = 'tinted', color = 'neutral', className, children, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cx(styles.badge, className)}
        data-color={color}
        data-variant={variant}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export type { BadgeProps, BadgeVariant, BadgeColor };
