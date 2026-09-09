import React, { cloneElement, isValidElement, useId } from 'react';
import styles from './Field.module.css';
import { cx } from '../../utils/cx';

export interface FieldProps {
  hint?: React.ReactNode;

  error?: React.ReactNode;

  className?: string;

  children: React.ReactElement;
}

interface InjectableProps {
  id?: string;
  'aria-describedby'?: string;
  error?: boolean;
}

export function Field({ hint, error, className, children }: FieldProps) {
  const autoId = useId();
  const hintId = `${autoId}-hint`;
  const errorId = `${autoId}-error`;

  const showError = Boolean(error);
  const showHint = Boolean(hint) && !showError;

  const child = isValidElement<InjectableProps>(children) ? children : null;

  const describedBy = cx(
    child?.props['aria-describedby'],
    showHint ? hintId : null,
    showError ? errorId : null
  );

  const control = child
    ? cloneElement(child, {
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        ...(showError ? { error: true } : {}),
      })
    : children;

  return (
    <div className={cx(styles.field, className)}>
      {control}
      {showHint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {showError && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}

Field.displayName = 'Field';
