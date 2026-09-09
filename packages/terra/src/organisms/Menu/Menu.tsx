import React, { createContext, useContext, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDismissableOverlay } from '../../hooks';
import type { Anchor, Placement } from '../../hooks';
import { Divider } from '../../atoms/Divider';
import { Button } from '../../atoms/Button';
import { ButtonIsland } from '../../molecules/ButtonIsland';
import type { Grade } from '../../types/types';
import styles from './Menu.module.css';
import { cx } from '../../utils/cx';

const ITEM_SELECTOR = '[role="menuitem"]:not(:disabled)';
const TYPEAHEAD_RESET_MS = 500;

export interface MenuProps {
  open: boolean;
  onClose?: () => void;
  anchor: Anchor | null;
  placement?: Placement;
  offset?: number;
  grade?: Grade;
  className?: string;
  children?: React.ReactNode;
}

interface MenuContextValue {
  onClose: () => void;
  grade: Grade;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

function useMenuContext(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error('Menu subcomponents must be used inside <Menu>.');
  }
  return ctx;
}

export function Menu({
  open,
  onClose,
  anchor,
  placement = 'bottom-start',
  offset = 4,
  grade = 'global',
  className,
  children,
}: MenuProps) {
  const typeahead = useRef<{
    buffer: string;
    timer: ReturnType<typeof setTimeout> | undefined;
  }>({
    buffer: '',
    timer: undefined,
  });

  const { root, panelRef, panel, style, requestClose } = useDismissableOverlay({
    open,
    onClose,
    anchor,
    placement,
    offset,
    initialFocusSelector: ITEM_SELECTOR,
  });

  const contextValue = useMemo<MenuContextValue>(
    () => ({ onClose: () => requestClose(true), grade }),
    [requestClose, grade]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!panel) return;
    const items = Array.from(
      panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR)
    );
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(currentIndex + 1 + items.length) % items.length]?.focus();
        return;
      case 'ArrowUp':
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        return;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        return;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        return;
      case 'Tab':
        requestClose(false);
        return;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const state = typeahead.current;
          clearTimeout(state.timer);
          state.buffer += event.key.toLowerCase();
          const match = items.find((item) =>
            item.textContent?.trim().toLowerCase().startsWith(state.buffer)
          );
          match?.focus();
          state.timer = setTimeout(() => {
            state.buffer = '';
          }, TYPEAHEAD_RESET_MS);
        }
    }
  };

  if (!open || !root) return null;

  return createPortal(
    <div ref={panelRef} style={style}>
      <ButtonIsland
        orientation="vertical"
        grade={grade}
        floating
        role="menu"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cx(styles.menu, className)}
      >
        <MenuContext.Provider value={contextValue}>
          {children}
        </MenuContext.Provider>
      </ButtonIsland>
    </div>,
    root
  );
}

Menu.displayName = 'Menu';

export interface MenuItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onSelect'
> {
  onSelect?: () => void;
  destructive?: boolean;
  active?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  closeOnSelect?: boolean;
  children?: React.ReactNode;
}

function MenuItem({
  onSelect,
  destructive = false,
  active = false,
  leadingIcon,
  trailingIcon,
  closeOnSelect = true,
  disabled,
  className,
  children,
  onClick,
  ...props
}: MenuItemProps) {
  const { onClose, grade } = useMenuContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (disabled) return;
    onSelect?.();
    if (closeOnSelect) onClose();
  };

  return (
    <Button
      type="button"
      role="menuitem"
      tabIndex={-1}
      grade={grade}
      disabled={disabled}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      data-destructive={destructive || undefined}
      data-active={active || undefined}
      className={cx(styles.item, className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}

MenuItem.displayName = 'Menu.Item';

Menu.Item = MenuItem;
Menu.Separator = Divider;
