import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('renders a search input rather than a plain textbox', () => {
    render(<SearchField aria-label="Search" />);
    expect(
      screen.getByRole('searchbox', { name: 'Search' })
    ).toBeInTheDocument();
  });

  it('offers the clear button only once there is something to clear', async () => {
    const user = userEvent.setup();
    render(<SearchField aria-label="Search" />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'redis');
    expect(
      screen.getByRole('button', { name: 'Clear search' })
    ).toBeInTheDocument();
  });

  it('clearing empties the field, reports it, and hands focus back', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SearchField aria-label="Search" onValueChange={onValueChange} />);
    const input = screen.getByRole('searchbox', { name: 'Search' });

    await user.type(input, 'redis');
    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(input).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(input).toHaveFocus();
  });

  it('Escape clears a non-empty field', async () => {
    const user = userEvent.setup();
    render(<SearchField aria-label="Search" />);
    const input = screen.getByRole('searchbox', { name: 'Search' });

    await user.type(input, 'redis{Escape}');
    expect(input).toHaveValue('');
  });

  it('swaps the clear button for a loading status while loading', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SearchField aria-label="Search" />);
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'redis');

    rerender(<SearchField aria-label="Search" loading />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('controlled: reports the typed value but leaves the field to the parent', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SearchField
        aria-label="Search"
        value="redis"
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByRole('searchbox', { name: 'Search' });

    await user.type(input, 'x');
    expect(onValueChange).toHaveBeenCalledWith('redisx');
    expect(input).toHaveValue('redis');
  });
});
