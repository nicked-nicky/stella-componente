import { Children, Fragment, isValidElement } from 'react';
import type { ReactNode } from 'react';

export function flattenFragments(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      const fragmentProps = child.props as { children?: ReactNode };
      result.push(...flattenFragments(fragmentProps.children));
    } else {
      result.push(child);
    }
  });
  return result;
}
