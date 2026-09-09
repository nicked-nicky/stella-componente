import React, { forwardRef } from 'react';
import type { Space } from '../../types/types';

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

type FlexAlign = 'start' | 'end' | 'center' | 'stretch' | 'baseline';

type FlexGap = Space;

type FlexElement =
  | 'div'
  | 'span'
  | 'section'
  | 'nav'
  | 'main'
  | 'aside'
  | 'ul'
  | 'li'
  | 'header'
  | 'footer';

interface FlexContainerProps extends React.HTMLAttributes<HTMLElement> {
  direction?: FlexDirection;

  gap?: FlexGap;

  wrap?: FlexWrap;

  justify?: FlexJustify;

  align?: FlexAlign;

  grow?: boolean;

  as?: FlexElement;

  children?: React.ReactNode;
}

const JUSTIFY_MAP: Record<FlexJustify, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

const ALIGN_MAP: Record<FlexAlign, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
  baseline: 'baseline',
};

export const FlexContainer = forwardRef<HTMLElement, FlexContainerProps>(
  (
    {
      direction = 'row',
      gap,
      wrap = 'nowrap',
      justify,
      align,
      grow = false,
      as = 'div',
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
        style={{
          display: 'flex',
          flexDirection: direction,
          flexWrap: wrap,
          gap: gap !== undefined ? `var(--stella-space-${gap})` : undefined,
          justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
          alignItems: align ? ALIGN_MAP[align] : undefined,
          ...(grow ? { flex: 1, minWidth: 0, minHeight: 0 } : {}),
          ...style,
        }}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

FlexContainer.displayName = 'FlexContainer';

export type {
  FlexContainerProps,
  FlexDirection,
  FlexWrap,
  FlexJustify,
  FlexAlign,
  FlexGap,
  FlexElement,
};
