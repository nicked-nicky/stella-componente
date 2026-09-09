import React, { forwardRef, useState } from 'react';
import styles from './Avatar.module.css';
import type { Grade } from '../../types/types';
import { resolveGrade } from '../../internal/grade';
import { cx } from '../../utils/cx';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;

  alt?: string;

  grade?: Grade;

  initials?: string;

  size?: AvatarSize;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      initials,
      grade: gradeProp,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const grade = resolveGrade(gradeProp, 'default');

    const [imageFailed, setImageFailed] = useState(false);
    const showImage = src && !imageFailed;

    return (
      <span
        ref={ref}
        data-stella-grade={grade}
        className={cx(styles.avatar, styles[`size-${size}`], className)}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : initials ? (
          <span className={styles.initials} aria-hidden={!!alt}>
            {initials.slice(0, 2)}
          </span>
        ) : (
          <svg
            className={styles.fallbackIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.5h19.6v-2.5c0-3.3-6.5-4.9-9.8-4.9z" />
          </svg>
        )}
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';

export type { AvatarProps, AvatarSize };
