import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { List } from './List';

function items() {
  return [
    <List.Item key="copy" value="copy">
      Copy
    </List.Item>,
    <List.Item key="paste" value="paste">
      Paste
    </List.Item>,
    <List.Item key="delete" value="delete">
      Delete
    </List.Item>,
  ];
}

describe('List — structure', () => {
  it('renders a listbox of options', () => {
    render(<List aria-label="Actions">{items()}</List>);
    const list = screen.getByRole('listbox', { name: 'Actions' });
    expect(within(list).getAllByRole('option')).toHaveLength(3);
  });

  it('keeps only the selected option in the tab order', () => {
    render(
      <List aria-label="Actions" defaultValue="paste">
        {items()}
      </List>
    );
    expect(screen.getByRole('option', { name: 'Paste' })).toHaveAttribute(
      'tabindex',
      '0'
    );
    expect(screen.getByRole('option', { name: 'Copy' })).toHaveAttribute(
      'tabindex',
      '-1'
    );
  });

  it('marks selection with aria-selected rather than styling alone', () => {
    render(
      <List aria-label="Actions" defaultValue="paste">
        {items()}
      </List>
    );
    expect(screen.getByRole('option', { name: 'Paste' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});

describe('List — keyboard navigation', () => {
  it('arrow keys move focus and wrap at both ends', async () => {
    const user = userEvent.setup();
    render(
      <List aria-label="Actions" defaultValue="copy">
        {items()}
      </List>
    );
    screen.getByRole('option', { name: 'Copy' }).focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Paste' })).toHaveFocus();

    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('option', { name: 'Delete' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Copy' })).toHaveFocus();
  });

  it('Home and End jump to the ends', async () => {
    const user = userEvent.setup();
    render(
      <List aria-label="Actions" defaultValue="copy">
        {items()}
      </List>
    );
    screen.getByRole('option', { name: 'Copy' }).focus();

    await user.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Copy' })).toHaveFocus();
  });

  it('Enter selects the focused option', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <List
        aria-label="Actions"
        defaultValue="copy"
        onValueChange={onValueChange}
      >
        {items()}
      </List>
    );
    screen.getByRole('option', { name: 'Copy' }).focus();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('paste');
  });

  it('typing jumps to the first option starting with those letters', async () => {
    const user = userEvent.setup();
    render(
      <List aria-label="Actions" defaultValue="copy">
        {items()}
      </List>
    );
    screen.getByRole('option', { name: 'Copy' }).focus();

    await user.keyboard('d');
    expect(screen.getByRole('option', { name: 'Delete' })).toHaveFocus();
  });
});

describe('List — disabled and value contract', () => {
  it('skips disabled options when navigating and refuses to select them', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <List
        aria-label="Actions"
        defaultValue="copy"
        onValueChange={onValueChange}
      >
        <List.Item value="copy">Copy</List.Item>
        <List.Item value="paste" disabled>
          Paste
        </List.Item>
        <List.Item value="delete">Delete</List.Item>
      </List>
    );
    screen.getByRole('option', { name: 'Copy' }).focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Delete' })).toHaveFocus();

    await user.click(screen.getByRole('option', { name: 'Paste' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('controlled: reports the click but leaves the selection to the parent', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <List aria-label="Actions" value="copy" onValueChange={onValueChange}>
        {items()}
      </List>
    );

    await user.click(screen.getByRole('option', { name: 'Delete' }));
    expect(onValueChange).toHaveBeenCalledWith('delete');
    expect(screen.getByRole('option', { name: 'Copy' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('throws a named error if List.Item is used outside List', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<List.Item value="orphan">Orphan</List.Item>)).toThrow(
      /must be used inside <List>/
    );
    spy.mockRestore();
  });
});
