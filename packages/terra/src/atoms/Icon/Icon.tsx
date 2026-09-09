import React, { cloneElement, forwardRef, isValidElement } from 'react';
import styles from './Icon.module.css';
import type { SizeSML } from '../../types/types';
import { cx } from '../../utils/cx';

type IconSize = SizeSML;

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: IconSize;

  title?: string;

  children: React.ReactNode;
}

const SIZE_PX: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  ({ size = 'md', title, className, children, ...props }, ref) => {
    const px = SIZE_PX[size];

    const content = isValidElement(children)
      ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          size: px,
          width: px,
          height: px,
        })
      : children;

    return (
      <span
        ref={ref}
        className={cx(styles.icon, styles[`size-${size}`], className)}
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        {...props}
      >
        {content}
      </span>
    );
  }
);

Icon.displayName = 'Icon';

export type { IconProps, IconSize };
