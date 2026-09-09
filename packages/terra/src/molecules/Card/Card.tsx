import React, { forwardRef } from 'react';
import { Island } from '../../atoms/Island';
import { Text } from '../../atoms/Text';
import type { Grade } from '../../types/types';
import styles from './Card.module.css';
import { resolveSurfaceGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  grade?: Grade;

  parentGrade?: Grade;

  nested?: boolean;

  children?: React.ReactNode;
}

const CardBase = forwardRef<HTMLElement, CardProps>(
  (
    {
      grade: gradeProp,
      parentGrade,
      nested = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const grade = resolveSurfaceGrade(gradeProp, parentGrade, 'default');

    return (
      <Island
        ref={ref}
        shape="panel"
        grade={grade}
        nested={nested}
        className={cx(styles.card, className)}
        {...props}
      >
        {children}
      </Island>
    );
  }
);

CardBase.displayName = 'Card';

function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.header, className)} {...props}>
      {children}
    </div>
  );
}

CardHeader.displayName = 'Card.Header';

function CardTitle({
  className,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLElement>, 'color'>) {
  return (
    <Text
      variant="title-3"
      as="h3"
      className={cx(styles.title, className)}
      {...props}
    >
      {children}
    </Text>
  );
}

CardTitle.displayName = 'Card.Title';

function CardDescription({
  className,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLElement>, 'color'>) {
  return (
    <Text
      variant="caption"
      color="secondary"
      as="p"
      className={cx(styles.description, className)}
      {...props}
    >
      {children}
    </Text>
  );
}

CardDescription.displayName = 'Card.Description';

function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.body, className)} {...props}>
      {children}
    </div>
  );
}

CardBody.displayName = 'Card.Body';

function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.footer, className)} {...props}>
      {children}
    </div>
  );
}

CardFooter.displayName = 'Card.Footer';

type CardComponent = typeof CardBase & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

const Card = CardBase as CardComponent;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
