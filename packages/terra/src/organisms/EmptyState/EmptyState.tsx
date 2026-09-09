import React from 'react';
import { Text } from '../../atoms/Text';
import styles from './EmptyState.module.css';
import type { SizeSM } from '../../types/types';
import { cx } from '../../utils/cx';

type EmptyStateSize = SizeSM;

export interface EmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  icon?: React.ReactNode;

  title?: React.ReactNode;

  description?: React.ReactNode;

  size?: EmptyStateSize;

  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  size = 'md',
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-stella-component="empty-state"
      className={cx(styles.emptyState, styles[`size-${size}`], className)}
      {...props}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {title && (
        <Text
          variant={size === 'sm' ? 'body-strong' : 'title-3'}
          as="p"
          className={styles.title}
        >
          {title}
        </Text>
      )}
      {description && (
        <Text
          variant={size === 'sm' ? 'caption' : 'body'}
          color="secondary"
          as="p"
          className={styles.description}
        >
          {description}
        </Text>
      )}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';

export type { EmptyStateSize };
