import { describe, expect, it, vi } from 'vitest';
import { useState, type ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from '../../providers/OverlayProvider';
import { Menu } from './Menu';

function MenuHarness({
  onClose,
  children,
}: {
  onClose?: () => void;
  children: ReactNode;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onClose?.();
  };
  return (
    <OverlayProvider>
      <button ref={setAnchor} onClick={() => setOpen(true)}>
        Trigger
      </button>
      <Menu open={open} onClose={close} anchor={anchor}>
        {children}
      </Menu>
    </OverlayProvider>
  );
}

async function renderOpenMenu(children: ReactNode, onClose?: () => void) {
  const user = userEvent.setup();
  render(
    <MenuHarness {...(onClose ? { onClose } : {})}>{children}</MenuHarness>
  );
  await user.click(screen.getByRole('button', { name: 'Trigger' }));
  await screen.findByRole('menu');
  return user;
}

async function waitForFocus(name: string) {
  await waitFor(() =>
    expect(screen.getByRole('menuitem', { name })).toHaveFocus()
  );
}

function defaultItems() {
  return [
    <Menu.Item key="copy">Copy</Menu.Item>,
    <Menu.Item key="paste">Paste</Menu.Item>,
    <Menu.Item key="delete">Delete</Menu.Item>,
  ];
}

describe('Menu — structure and ARIA', () => {
  it('renders role="menu" containing role="menuitem" children', async () => {
    await renderOpenMenu(defaultItems());
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
  });

  it('takes items out of the natural tab order (roving focus, not tab-through)', async () => {
    await renderOpenMenu(defaultItems());
    screen.getAllByRole('menuitem').forEach((item) => {
      expect(item).toHaveAttribute('tabindex', '-1');
    });
  });

  it('renders no separator unless one is explicitly added', async () => {
    await renderOpenMenu(defaultItems());
    const menu = screen.getByRole('menu');
    expect(within(menu).queryAllByRole('separator')).toHaveLength(0);
  });

  it('supports an explicit Menu.Separator between items', async () => {
    await renderOpenMenu([
      <Menu.Item key="copy">Copy</Menu.Item>,
      <Menu.Separator key="sep" />,
      <Menu.Item key="delete">Delete</Menu.Item>,
    ]);
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('separator')).toHaveLength(1);
  });

  it('is absent from the document when closed', () => {
    render(
      <OverlayProvider>
        <Menu open={false} anchor={null}>
          <Menu.Item>Copy</Menu.Item>
        </Menu>
      </OverlayProvider>
    );
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('becomes visible on open rather than staying hidden behind its own measurement', async () => {
    await renderOpenMenu(defaultItems());
    const menu = screen.getByRole('menu');
    const positioner = menu.parentElement!;
    expect(positioner.style.visibility).not.toBe('hidden');
  });
});

describe('Menu — keyboard navigation', () => {
  it('focuses the first item on open', async () => {
    await renderOpenMenu(defaultItems());
    await waitForFocus('Copy');
  });

  it('ArrowDown moves focus to the next item', async () => {
    const user = await renderOpenMenu(defaultItems());
    await waitForFocus('Copy');

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Paste' })).toHaveFocus();
  });

  it('ArrowUp moves focus to the previous item', async () => {
    const user = await renderOpenMenu(defaultItems());
    await waitForFocus('Copy');

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Paste' })).toHaveFocus();
  });

  it('ArrowDown wraps from the last item to the first', async () => {
    const user = await renderOpenMenu(defaultItems());
    await waitForFocus('Copy');

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Copy' })).toHaveFocus();
  });

  it('ArrowUp wraps from the first item to the last', async () => {
    const user = await renderOpenMenu(defaultItems());
    await waitForFocus('Copy');

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });

  it('Home and End jump to the ends', async () => {
    const user = await renderOpenMenu(defaultItems());
    await waitForFocus('Copy');

    await user.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: 'Copy' })).toHaveFocus();
  });

  it('skips disabled items when navigating', async () => {
    const user = await renderOpenMenu([
      <Menu.Item key="copy">Copy</Menu.Item>,
      <Menu.Item key="paste" disabled>
        Paste
      </Menu.Item>,
      <Menu.Item key="delete">Delete</Menu.Item>,
    ]);
    await waitForFocus('Copy');

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });
});

describe('Menu — typeahead', () => {
  it('typing a letter jumps to the first item starting with it', async () => {
    const user = await renderOpenMenu(defaultItems());
    await waitForFocus('Copy');

    await user.keyboard('d');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
  });

  it('is case-insensitive', async () => {
    const user = await renderOpenMenu(defaultItems());
    await waitForFocus('Copy');

    await user.keyboard('P');
    expect(screen.getByRole('menuitem', { name: 'Paste' })).toHaveFocus();
  });

  it('accumulates consecutive letters to disambiguate', async () => {
    const user = await renderOpenMenu([
      <Menu.Item key="save">Save</Menu.Item>,
      <Menu.Item key="select">Select all</Menu.Item>,
    ]);
    await waitForFocus('Save');

    await user.keyboard('se');
    expect(screen.getByRole('menuitem', { name: 'Select all' })).toHaveFocus();
  });

  it('ignores whitespace so Space stays available for activation', async () => {
    const onSelect = vi.fn();
    const user = await renderOpenMenu([
      <Menu.Item key="copy" onSelect={onSelect}>
        Copy
      </Menu.Item>,
      <Menu.Item key="paste">Paste</Menu.Item>,
    ]);
    await waitForFocus('Copy');

    await user.keyboard(' ');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('Menu — dismissal', () => {
  it('Escape closes the menu', async () => {
    const onClose = vi.fn();
    const user = await renderOpenMenu(defaultItems(), onClose);
    await waitForFocus('Copy');

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Tab closes the menu rather than tabbing through its items', async () => {
    const onClose = vi.fn();
    const user = await renderOpenMenu(defaultItems(), onClose);
    await waitForFocus('Copy');

    await user.tab();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('an outside click closes the menu', async () => {
    const onClose = vi.fn();
    const user = await renderOpenMenu(defaultItems(), onClose);
    await waitForFocus('Copy');

    await user.click(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('selecting an item fires onSelect and closes', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const user = await renderOpenMenu(
      [
        <Menu.Item key="copy" onSelect={onSelect}>
          Copy
        </Menu.Item>,
        <Menu.Item key="paste">Paste</Menu.Item>,
      ],
      onClose
    );
    await waitForFocus('Copy');

    await user.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closeOnSelect={false} keeps the menu open after a selection', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const user = await renderOpenMenu(
      [
        <Menu.Item key="toggle" onSelect={onSelect} closeOnSelect={false}>
          Toggle
        </Menu.Item>,
        <Menu.Item key="paste">Paste</Menu.Item>,
      ],
      onClose
    );
    await waitForFocus('Toggle');

    await user.click(screen.getByRole('menuitem', { name: 'Toggle' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('a disabled item does not fire onSelect', async () => {
    const onSelect = vi.fn();
    const user = await renderOpenMenu([
      <Menu.Item key="copy">Copy</Menu.Item>,
      <Menu.Item key="paste" disabled onSelect={onSelect}>
        Paste
      </Menu.Item>,
    ]);
    await waitForFocus('Copy');

    await user.click(screen.getByRole('menuitem', { name: 'Paste' }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('Menu — compound-component guard', () => {
  it('throws a named error if Menu.Item is used outside Menu', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Menu.Item>Orphan</Menu.Item>)).toThrow(
      /must be used inside <Menu>/
    );
    spy.mockRestore();
  });
});
