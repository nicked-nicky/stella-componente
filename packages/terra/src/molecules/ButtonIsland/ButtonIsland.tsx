import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';
import { Island } from '../../atoms/Island';
import { FlexContainer } from '../../layout/FlexContainer';
import type { FlexContainerProps } from '../../layout/FlexContainer';
import { Button } from '../../atoms/Button';
import type { ButtonProps, ButtonSize } from '../../atoms/Button';
import styles from './ButtonIsland.module.css';
import type { Grade } from '../../types/types';
import { resolveSurfaceGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';
import { flattenFragments } from '../../utils/flattenFragments';

type ButtonIslandOrientation = 'horizontal' | 'vertical';

// A Button is often wrapped in a single-child decorator like Tooltip before
// it reaches ButtonIsland. Peek through those wrappers (the same "one
// ReactElement child" shape Tooltip itself expects) to find the Button that
// actually needs the island's size/grade, rather than silently skipping it.
function findButton(
  node: React.ReactNode
): React.ReactElement<ButtonProps> | undefined {
  if (!isValidElement(node)) return undefined;
  if (node.type === Button) return node as React.ReactElement<ButtonProps>;
  const { children } = node.props as { children?: React.ReactNode };
  return isValidElement(children) ? findButton(children) : undefined;
}

function withButtonProps(
  node: React.ReactNode,
  apply: (
    button: React.ReactElement<ButtonProps>
  ) => React.ReactElement<ButtonProps>
): React.ReactNode {
  if (!isValidElement(node)) return node;
  if (node.type === Button) {
    return apply(node as React.ReactElement<ButtonProps>);
  }
  const { children } = node.props as { children?: React.ReactNode };
  if (!isValidElement(children)) return node;
  return cloneElement(
    node as React.ReactElement<{ children?: React.ReactNode }>,
    {
      children: withButtonProps(children, apply),
    }
  );
}

interface ButtonIslandProps extends Omit<
  FlexContainerProps,
  'direction' | 'ref'
> {
  grade?: Grade;

  parentGrade?: Grade;

  size?: ButtonSize;

  orientation?: ButtonIslandOrientation;

  floating?: boolean;
}

const ButtonIsland = forwardRef<HTMLElement, ButtonIslandProps>(
  (
    {
      size = 'md',
      gap = '0',
      align,
      grade: gradeProp,
      parentGrade,
      orientation = 'horizontal',
      floating = false,
      children,
      style,
      className,
      ...flexProps
    },
    ref
  ) => {
    const grade = resolveSurfaceGrade(gradeProp, parentGrade, 'default');
    const vertical = orientation === 'vertical';

    const childArray = Children.toArray(flattenFragments(children));
    const onlyChild = childArray.length === 1 ? childArray[0] : undefined;
    const onlyChildButton = onlyChild ? findButton(onlyChild) : undefined;
    // stretchButton is only for a lone *text* button filling the pill —
    // an icon-only button must stay square, and flex-basis:0 from
    // stretchButton would win over the aspect-ratio trick below and
    // squash it, so icon-only buttons are excluded regardless of count.
    const isSingleButton =
      !vertical &&
      onlyChildButton !== undefined &&
      !onlyChildButton.props.iconOnly;

    const preparedChildren = childArray.map((child) =>
      withButtonProps(child, (button) => {
        const childProps = button.props;
        return cloneElement(button, {
          size: size,
          grade: grade,
          className: cx(
            isSingleButton && styles.stretchButton,
            vertical && childProps.iconOnly && styles.verticalIconOnly,
            childProps.className
          ),
          style:
            childProps.iconOnly && !vertical
              ? { width: 'auto', aspectRatio: '1', ...childProps.style }
              : childProps.style,
        });
      })
    );

    return (
      <Island
        ref={ref}
        shape={vertical ? 'panel' : 'pill'}
        grade={grade}
        floating={floating}
        className={cx(
          styles.root,
          styles[`size-${size}`],
          vertical && styles.vertical,
          className
        )}
        style={{ alignItems: 'stretch', ...style }}
      >
        <FlexContainer
          direction={vertical ? 'column' : 'row'}
          gap={gap}
          align={align ?? 'stretch'}
          className={styles.group}
          {...flexProps}
        >
          {preparedChildren}
        </FlexContainer>
      </Island>
    );
  }
);

ButtonIsland.displayName = 'ButtonIsland';

export { ButtonIsland };
export type { ButtonIslandProps, ButtonIslandOrientation };
