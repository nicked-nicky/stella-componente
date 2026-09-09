import React, { forwardRef } from 'react';
import styles from './Island.module.css';
import type { Grade, Space } from '../../types/types';
import { cx } from '../../utils/cx';

type IslandShape = 'panel' | 'pill';
type IslandElement =
  'div' | 'section' | 'nav' | 'main' | 'aside' | 'header' | 'footer';

interface IslandProps extends React.HTMLAttributes<HTMLElement> {
  shape?: IslandShape;

  grade?: Grade;

  padding?: Space;

  nested?: boolean;

  floating?: boolean;

  as?: IslandElement;

  children?: React.ReactNode;
}

export const Island = forwardRef<HTMLElement, IslandProps>(
  (
    {
      shape = 'panel',
      grade,
      padding,
      nested = false,
      floating = false,
      as = 'div',
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const Element = as as React.ElementType;

    return (
      <Element
        ref={ref}
        data-stella-component="island"
        data-stella-grade={grade}
        data-stella-nested={nested && grade === 'elevated' ? '' : undefined}
        className={cx(
          styles.island,
          styles[`shape-${shape}`],
          floating && styles.floating,
          className
        )}
        style={
          padding !== undefined
            ? { padding: `var(--stella-space-${padding})`, ...style }
            : style
        }
        {...props}
      >
        {children}
      </Element>
    );
  }
);

Island.displayName = 'Island';

export type { IslandProps, IslandShape, IslandElement };
