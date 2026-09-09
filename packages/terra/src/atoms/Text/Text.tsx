import React, { forwardRef } from 'react';
import styles from './Text.module.css';
import { cx } from '../../utils/cx';

type TextVariant =
  | 'display'
  | 'title-1'
  | 'title-2'
  | 'title-3'
  | 'body'
  | 'body-strong'
  | 'caption'
  | 'caption-strong'
  | 'mono';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'disabled';

type TextElement =
  'span' | 'p' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'kbd';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;

  as?: TextElement;

  color?: TextColor;

  truncate?: boolean;

  children?: React.ReactNode;
}

const DEFAULT_ELEMENT: Record<TextVariant, TextElement> = {
  display: 'h1',
  'title-1': 'h1',
  'title-2': 'h2',
  'title-3': 'h3',
  body: 'span',
  'body-strong': 'span',
  caption: 'span',
  'caption-strong': 'span',
  mono: 'span',
};

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      variant = 'body',
      as,
      color = 'primary',
      truncate = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Element = (as ?? DEFAULT_ELEMENT[variant]) as React.ElementType;

    return (
      <Element
        ref={ref}
        className={cx(
          styles.text,
          styles[variant],
          styles[`color-${color}`],
          truncate && styles.truncate,
          className
        )}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

Text.displayName = 'Text';

export type { TextProps, TextVariant, TextColor, TextElement };
