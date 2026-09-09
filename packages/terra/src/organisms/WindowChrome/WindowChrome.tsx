import React, { useEffect, useRef } from 'react';
import { Island } from '../../atoms/Island';
import { Text } from '../../atoms/Text';
import type { ButtonSize } from '../../atoms/Button';
import { FlexContainer } from '../../layout/FlexContainer';
import { ButtonIsland } from '../../molecules/ButtonIsland';
import { WindowControls } from '../../molecules/WindowControls';
import type { WindowControlsHandlers } from '../../molecules/WindowControls';
import styles from './WindowChrome.module.css';
import dragStyles from './dragRegion.module.css';
import { cx } from '../../utils/cx';
import { flattenFragments } from '../../utils/flattenFragments';
import type { Grade, SizeSML, SizeXSL, Space } from '../../types/types';
import { Icon } from '../../atoms/Icon';

export interface WindowChromeProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  tabs?: React.ReactNode;
  tools?: React.ReactNode;
  systemTools?: React.ReactNode;
  windowControls: WindowControlsHandlers;
  children?: React.ReactNode;
  size?: ButtonSize;

  grade?: Grade;

  gap?: Space;

  className?: string;
}

export function WindowChrome({
  icon,
  title,
  tabs,
  tools,
  systemTools,
  windowControls,
  size = 'md',
  grade = 'global',
  gap = '2',
  className,
  children,
}: WindowChromeProps) {
  const headerClassName = cx(
    styles.chrome,
    styles[`size-${size}`],
    dragStyles.dragRegion,
    className
  );

  const handleDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest(`.${dragStyles.noDrag}`)) {
      return;
    }
    windowControls.maximize?.();
  };

  const tabsContentRef = useRef<HTMLElement>(null);
  const hasTabs = Boolean(tabs);

  useEffect(() => {
    const el = tabsContentRef.current;
    if (!el) return;

    const fadeSize =
      getComputedStyle(el).getPropertyValue('--tabs-fade').trim() || '32px';
    const getMaxScroll = () => el.scrollWidth - el.clientWidth;

    const updateFade = () => {
      el.style.setProperty(
        '--fade-left',
        el.scrollLeft > 0.5 ? fadeSize : '0px'
      );
      el.style.setProperty(
        '--fade-right',
        el.scrollLeft < getMaxScroll() - 0.5 ? fadeSize : '0px'
      );
    };

    let scrollTarget = el.scrollLeft;
    let animationFrame: number | undefined;

    const animate = () => {
      const diff = scrollTarget - el.scrollLeft;
      if (Math.abs(diff) < 1) {
        el.scrollLeft = scrollTarget;
        animationFrame = undefined;
        return;
      }
      // el.scrollLeft is rounded to whole pixels by some engines (e.g. WebView2), so a
      // sub-1px step here would get silently rounded away and the animation would never
      // converge on the target — always move at least 1px toward it.
      const step = diff * 0.25;
      el.scrollLeft += Math.abs(step) < 1 ? Math.sign(diff) : step;
      animationFrame = requestAnimationFrame(animate);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;
      event.preventDefault();
      scrollTarget = Math.min(
        Math.max(scrollTarget + event.deltaY, 0),
        getMaxScroll()
      );
      if (animationFrame === undefined) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const resizeObserver = new ResizeObserver(updateFade);
    resizeObserver.observe(el);

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', updateFade);
    updateFade();

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', updateFade);
      resizeObserver.disconnect();
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [hasTabs]);

  if (!icon && !title && !tabs && !tools && !systemTools) {
    return (
      <header
        data-tauri-drag-region=""
        onDoubleClick={handleDoubleClick}
        className={headerClassName}
      >
        <FlexContainer
          align="center"
          grow
          gap={gap}
          className={cx(styles.content, dragStyles.noDrag)}
        >
          {children}
        </FlexContainer>
        <WindowControls
          controls={windowControls}
          size={size}
          className={dragStyles.noDrag}
        />
      </header>
    );
  }

  return (
    <header
      data-tauri-drag-region=""
      onDoubleClick={handleDoubleClick}
      className={headerClassName}
    >
      {(icon || title) && (
        <Island shape="pill" grade={grade} className={styles.brand}>
          <FlexContainer align="center" gap={gap}>
            {icon && (
              <span
                className={styles.icon}
                aria-hidden={title ? 'true' : undefined}
              >
                <Icon size={size as SizeSML}>{icon}</Icon>
              </span>
            )}
            {title && (
              <Text variant="body-strong" truncate>
                {title}
              </Text>
            )}
          </FlexContainer>
        </Island>
      )}

      <FlexContainer
        align="center"
        grow
        style={{ minWidth: 'var(--tabs-region-min-width)' }}
        className={cx(styles.tabsRegion, hasTabs && dragStyles.noDrag)}
      >
        {tabs && (
          <FlexContainer
            ref={tabsContentRef}
            align="center"
            gap={gap}
            className={styles.tabsContent}
          >
            {flattenFragments(tabs).map((child, index) => {
              if (!React.isValidElement(child)) {
                return child;
              }
              const childProps = child.props as {
                size?: SizeXSL;
                grade?: Grade;
                className?: string;
              };
              return React.cloneElement(
                child as React.ReactElement<typeof childProps>,
                {
                  key: child.key ?? index,
                  size,
                  grade,
                  className: cx(childProps.className, styles.tabItem),
                }
              );
            })}
          </FlexContainer>
        )}
      </FlexContainer>

      <div className={styles.spacer} />

      {tools && (
        <ButtonIsland size={size} grade={grade} className={dragStyles.noDrag}>
          {tools}
        </ButtonIsland>
      )}

      <FlexContainer
        align="center"
        gap={gap}
        className={cx(styles.trailing, dragStyles.noDrag)}
      >
        {systemTools && (
          <ButtonIsland size={size} grade={grade}>
            {systemTools}
          </ButtonIsland>
        )}
        <WindowControls controls={windowControls} size={size} grade={grade} />
      </FlexContainer>
    </header>
  );
}

WindowChrome.displayName = 'WindowChrome';
