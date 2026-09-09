import React, { forwardRef, useRef, useState } from 'react';
import { Input } from '../../atoms/Input';
import type { InputProps } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { Spinner } from '../../atoms/Spinner';
import { mergeRefs } from '../../utils/mergeRefs';
import { CloseIcon, SearchIcon } from '../../utils/icons';
import styles from './SearchField.module.css';
import { cx } from '../../utils/cx';

export interface SearchFieldProps extends Omit<
  InputProps,
  'type' | 'leadingIcon' | 'trailingIcon' | 'trailingAction'
> {
  onValueChange?: (value: string) => void;

  onClear?: () => void;

  loading?: boolean;

  clearable?: boolean;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      onValueChange,
      onClear,
      loading = false,
      clearable = true,
      value,
      defaultValue,
      className,
      onChange,
      onKeyDown,
      ...props
    },
    forwardedRef
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);
    const setRefs = mergeRefs(innerRef, forwardedRef);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(
      String(defaultValue ?? '')
    );
    const currentValue = isControlled ? String(value) : internalValue;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(event.target.value);
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    const clear = () => {
      if (!isControlled) {
        setInternalValue('');
        if (innerRef.current) innerRef.current.value = '';
      }
      onValueChange?.('');
      onClear?.();
      innerRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.key === 'Escape' && currentValue) {
        event.stopPropagation();
        clear();
      }
    };

    const showClear = clearable && !loading && currentValue.length > 0;

    const trailing = loading ? (
      <Spinner size="sm" />
    ) : showClear ? (
      <Button
        iconOnly
        className={styles.clear}
        onClick={clear}
        aria-label="Clear search"
      >
        <CloseIcon />
      </Button>
    ) : undefined;

    return (
      <Input
        ref={setRefs}
        type="search"
        leadingIcon={<SearchIcon />}
        {...(trailing ? { trailingAction: trailing } : {})}
        className={cx(styles.input, className)}
        {...(isControlled
          ? { value: currentValue }
          : { defaultValue: defaultValue as string | undefined })}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

SearchField.displayName = 'SearchField';
