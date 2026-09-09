import React, { forwardRef } from 'react';
import styles from './Skeleton.module.css';
import type { Grade } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  grade?: Grade;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      grade: gradeProp,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    return (
      <div
        ref={ref}
        data-stella-grade={grade}
        aria-hidden="true"
        className={cx(styles.skeleton, styles[variant], className)}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export type { SkeletonProps, SkeletonVariant };
