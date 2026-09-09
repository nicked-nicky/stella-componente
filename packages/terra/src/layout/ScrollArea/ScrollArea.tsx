import React, { forwardRef } from 'react';
import styles from './ScrollArea.module.css';
import type { Space } from '../../types/types';
import { cx } from '../../utils/cx';

type ScrollAxis = 'vertical' | 'horizontal' | 'both';

type ScrollElement = 'div' | 'section' | 'nav' | 'aside' | 'main';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLElement> {
  axis?: ScrollAxis;

  grow?: boolean;

  padding?: Space;

  as?: ScrollElement;

  /**
   * Hides the scrollbar entirely (no thumb/track, and no reserved gutter
   * space) while keeping the element scrollable via wheel/touch/keyboard.
   */
  hideScrollbar?: boolean;

  children?: React.ReactNode;
}

export const ScrollArea = forwardRef<HTMLElement, ScrollAreaProps>(
  (
    {
      axis = 'vertical',
      grow = false,
      padding,
      as = 'div',
      hideScrollbar = false,
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
        data-stella-component="scroll-area"
        className={cx(
          styles.scrollArea,
          styles[axis],
          grow && styles.grow,
          hideScrollbar && styles.hideScrollbar,
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

ScrollArea.displayName = 'ScrollArea';

export type { ScrollAreaProps, ScrollAxis, ScrollElement };
