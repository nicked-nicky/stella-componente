import React from 'react';
import { CloseIcon } from '../../utils/icons';
import { Button } from '../../atoms/Button';
import styles from './Notification.module.css';
import { cx } from '../../utils/cx';

type NotificationVariant = 'info' | 'success' | 'warning' | 'error' | 'debug';

interface NotificationProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  variant?: NotificationVariant;

  icon?: React.ReactNode;

  onDismiss?: () => void;

  closing?: boolean;

  children: React.ReactNode;
}

export function Notification({
  variant = 'info',
  icon,
  onDismiss,
  closing = false,
  className,
  children,
  ...props
}: NotificationProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx(
        styles.notification,
        styles[variant],
        closing && styles.closing,
        className
      )}
      {...props}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.message}>{children}</span>
      {onDismiss && (
        <Button
          iconOnly
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  );
}

Notification.displayName = 'Notification';

export type { NotificationProps, NotificationVariant };
