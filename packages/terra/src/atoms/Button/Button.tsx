import React, { forwardRef } from 'react';
import { Spinner } from '../Spinner';
import type { Grade, SizeSML, SizeXSL } from '../../types/types';
import styles from './Button.module.css';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon';

type ButtonSize = SizeXSL;

type ButtonGrade = Grade;

const ICON_SIZE: Record<ButtonSize, SizeSML> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;

  grade?: ButtonGrade;
  active?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  iconOnly?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = 'md',
      grade = 'default',
      active = false,
      loading = false,
      leadingIcon,
      trailingIcon,
      iconOnly = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classes = cx(
      styles.button,
      styles[`size-${size}`],
      active && styles.active,
      isDisabled && styles.disabled,
      loading && styles.loading,
      iconOnly && styles.iconOnly,
      className
    );

    return (
      <button
        ref={ref}
        data-stella-grade={grade}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className={styles.spinnerContainer} aria-hidden="true">
            <Spinner size={size} />
          </span>
        )}

        {iconOnly ? (
          (children || leadingIcon) && (
            <span className={styles.icon} aria-hidden="true">
              <Icon size={ICON_SIZE[size]}>{children ?? leadingIcon}</Icon>
            </span>
          )
        ) : (
          <>
            {leadingIcon && (
              <span className={styles.icon} aria-hidden="true">
                {leadingIcon}
              </span>
            )}

            {children && <span className={styles.text}>{children}</span>}

            {trailingIcon && (
              <span className={styles.icon} aria-hidden="true">
                {trailingIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export type { ButtonProps, ButtonSize, ButtonGrade };
