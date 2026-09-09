import React, { forwardRef, useEffect, useRef } from 'react';
import { mergeRefs } from '../../utils/mergeRefs';
import styles from './Textarea.module.css';
import type { Grade, SizeSML } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type TextareaSize = SizeSML;

interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  grade?: Grade;

  size?: TextareaSize;

  error?: boolean;

  autoGrow?: boolean;

  maxRows?: number;

  label?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      grade: gradeProp,
      size = 'md',
      error = false,
      autoGrow = true,
      maxRows,
      label,
      disabled,
      id,
      className,
      onChange,
      style,
      ...props
    },
    forwardedRef
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    const innerRef = useRef<HTMLTextAreaElement>(null);
    const setRefs = mergeRefs(innerRef, forwardedRef);
    const autoId = React.useId();
    const textareaId = label ? (id ?? autoId) : id;

    const resize = () => {
      const node = innerRef.current;
      if (!node || !autoGrow) return;
      node.style.height = 'auto';
      node.style.height = `${node.scrollHeight}px`;
    };

    useEffect(() => {
      resize();
    }, [autoGrow]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      resize();
      onChange?.(event);
    };

    const maxHeightStyle: React.CSSProperties | undefined =
      autoGrow && maxRows
        ? { maxHeight: `calc(var(--stella-text-body-lh) * ${maxRows}em)` }
        : undefined;

    const field = (
      <span
        data-stella-grade={grade}
        className={cx(
          styles.wrapper,
          styles[`size-${size}`],
          error && styles.error,
          disabled && styles.disabled
        )}
      >
        <textarea
          ref={setRefs}
          id={textareaId}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cx(
            styles.textarea,
            autoGrow && styles.autoGrow,
            className
          )}
          style={{ ...maxHeightStyle, ...style }}
          onChange={handleChange}
          {...props}
        />
      </span>
    );

    if (!label) return field;

    return (
      <span className={styles.field}>
        <label htmlFor={textareaId} className={styles.fieldLabel}>
          {label}
        </label>
        {field}
      </span>
    );
  }
);

Textarea.displayName = 'Textarea';

export type { TextareaProps, TextareaSize };
