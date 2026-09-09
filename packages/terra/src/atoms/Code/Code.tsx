import React, { forwardRef } from 'react';
import styles from './Code.module.css';
import { useOptionalNotifications } from '../../providers/NotificationProvider';
import type { Grade } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  grade?: Grade;
  children?: React.ReactNode;
}

export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ className, grade: gradeProp, children, ...props }, ref) => {
    const grade = resolveGrade(gradeProp, 'default');

    const notifyApi = useOptionalNotifications();

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(children?.toString() || '');
        notifyApi?.info('Copied successfully!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        notifyApi?.error('Failed to copy!');
      }
    };

    return (
      <code
        data-stella-grade={grade}
        ref={ref}
        className={cx(styles.code, className)}
        onClick={handleCopy}
        {...props}
      >
        {children}
      </code>
    );
  }
);

Code.displayName = 'Code';

export type { CodeProps };
