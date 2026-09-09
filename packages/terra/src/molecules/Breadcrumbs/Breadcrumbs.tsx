import React, { Children, isValidElement } from 'react';
import { ChevronRightIcon } from '../../utils/icons';
import { Link } from '../../atoms/Link';
import type { Grade } from '../../types/types';
import styles from './Breadcrumbs.module.css';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

export interface BreadcrumbsProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  grade?: Grade;

  separator?: React.ReactNode;

  children?: React.ReactNode;
}

export interface BreadcrumbsItemProps extends React.HTMLAttributes<HTMLElement> {
  href?: string;

  current?: boolean;

  children?: React.ReactNode;
}

function BreadcrumbsItem({
  href,
  current = false,
  className,
  children,
  ...props
}: BreadcrumbsItemProps) {
  const content =
    href && !current ? (
      <Link href={href} className={styles.link} {...props}>
        {children}
      </Link>
    ) : (
      <span
        aria-current={current ? 'page' : undefined}
        className={cx(styles.text, current && styles.current)}
        {...props}
      >
        {children}
      </span>
    );

  return <li className={cx(styles.item, className)}>{content}</li>;
}

BreadcrumbsItem.displayName = 'Breadcrumbs.Item';

function BreadcrumbsBase({
  grade: gradeProp,
  separator,
  className,
  children,
  ...props
}: BreadcrumbsProps) {
  const grade = resolveGrade(gradeProp, 'default');
  const items = Children.toArray(children).filter(isValidElement);
  const lastIndex = items.length - 1;

  return (
    <nav
      aria-label="Breadcrumb"
      data-stella-grade={grade}
      className={cx(styles.breadcrumbs, className)}
      {...props}
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          const element = isValidElement<BreadcrumbsItemProps>(item)
            ? item.props.current === undefined && isLast
              ? React.cloneElement(item, { current: true })
              : item
            : item;

          return (
            <React.Fragment key={item.key ?? index}>
              {element}
              {!isLast && (
                <li aria-hidden="true" className={styles.separator}>
                  {separator ?? (
                    <span className={styles.separatorIcon}>
                      <ChevronRightIcon />
                    </span>
                  )}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

BreadcrumbsBase.displayName = 'Breadcrumbs';

type BreadcrumbsComponent = typeof BreadcrumbsBase & {
  Item: typeof BreadcrumbsItem;
};

const Breadcrumbs = BreadcrumbsBase as BreadcrumbsComponent;
Breadcrumbs.Item = BreadcrumbsItem;

export { Breadcrumbs };
