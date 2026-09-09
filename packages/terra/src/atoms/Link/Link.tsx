import React, { forwardRef } from 'react';
import styles from './Link.module.css';
import { cx } from '../../utils/cx';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;

  children?: React.ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ external = false, target, rel, className, children, ...props }, ref) => {
    const resolvedTarget = external ? '_blank' : target;
    const resolvedRel =
      resolvedTarget === '_blank' ? cx(rel, 'noopener', 'noreferrer') : rel;

    return (
      <a
        ref={ref}
        target={resolvedTarget}
        rel={resolvedRel}
        className={cx(styles.link, className)}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';

export type { LinkProps };
