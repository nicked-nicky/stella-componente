import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input — value contract', () => {
  it('accepts typed text when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Email" />);
    const input = screen.getByRole('textbox', { name: 'Email' });

    await user.type(input, 'hello@example.com');
    expect(input).toHaveValue('hello@example.com');
  });

  it('defers to the parent when controlled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Email" value="fixed" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Email' });

    await user.type(input, 'x');
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('fixed');
  });

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Email" disabled onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(input).toBeDisabled();
    await user.type(input, 'nope');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards its ref to the input element, not the styling wrapper', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    ref.current?.focus();
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  });
});

describe('Input — error state', () => {
  it('sets aria-invalid when error is set, and omits it otherwise', () => {
    const { unmount } = render(<Input aria-label="Email" error />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    unmount();

    render(<Input aria-label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute(
      'aria-invalid'
    );
  });
});

describe('Input — label', () => {
  it('associates a provided label via a generated id', () => {
    render(<Input label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('respects an explicit id instead of generating one', () => {
    render(<Input label="Email" id="email-field" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'id',
      'email-field'
    );
  });

  it('renders no <label> at all when the prop is omitted', () => {
    render(<Input aria-label="Email" />);
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });
});

describe('Input — decoration slots', () => {
  it('hides decorative icons from the accessibility tree', () => {
    render(
      <Input
        aria-label="Search"
        leadingIcon={<span data-testid="lead">L</span>}
        trailingIcon={<span data-testid="trail">T</span>}
      />
    );
    expect(screen.getByTestId('lead').parentElement).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    expect(screen.getByTestId('trail').parentElement).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('leaves trailingAction reachable, since it holds real controls', () => {
    render(
      <Input
        aria-label="Search"
        trailingAction={<button type="button">Clear</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});
