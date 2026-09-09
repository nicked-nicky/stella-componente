import React from 'react';
import {
  CloseIcon,
  DebugIcon,
  ErrorIcon,
  InfoIcon,
  SuccessIcon,
  WarningIcon,
} from '../../utils/icons';
import { Button } from '../../atoms/Button';
import styles from './Alert.module.css';
import { cx } from '../../utils/cx';

type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'debug';

export interface AlertProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  variant?: AlertVariant;

  title?: React.ReactNode;

  icon?: React.ReactNode | null;

  onDismiss?: () => void;

  children?: React.ReactNode;
}

const DEFAULT_ICON: Record<AlertVariant, React.ReactNode> = {
  info: <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
  debug: <DebugIcon />,
};

export function Alert({
  variant = 'info',
  title,
  icon,
  onDismiss,
  className,
  children,
  ...props
}: AlertProps) {
  const resolvedIcon = icon === undefined ? DEFAULT_ICON[variant] : icon;
  const assertive = variant === 'error' || variant === 'warning';

  return (
    <div
      role={assertive ? 'alert' : 'status'}
      data-stella-component="alert"
      className={cx(styles.alert, styles[variant], className)}
      {...props}
    >
      {resolvedIcon && (
        <span className={styles.icon} aria-hidden="true">
          {resolvedIcon}
        </span>
      )}
      <div className={styles.content}>
        {title && <span className={styles.title}>{title}</span>}
        {children && <span className={styles.message}>{children}</span>}
      </div>
      {onDismiss && (
        <Button
          iconOnly
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  );
}

Alert.displayName = 'Alert';

export type { AlertVariant };
