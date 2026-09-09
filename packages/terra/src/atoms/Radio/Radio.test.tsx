import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from './Radio';

describe('Radio — label association', () => {
  it('associates the generated label with the input', () => {
    render(<Radio label="Free plan" />);
    expect(
      screen.getByRole('radio', { name: 'Free plan' })
    ).toBeInTheDocument();
  });

  it('honours a caller-supplied id instead of generating one', () => {
    render(<Radio id="plan-free" label="Free plan" />);
    expect(screen.getByRole('radio', { name: 'Free plan' })).toHaveAttribute(
      'id',
      'plan-free'
    );
  });

  it('gives each instance a unique id when none is supplied', () => {
    render(
      <>
        <Radio label="One" />
        <Radio label="Two" />
      </>
    );
    const [first, second] = screen.getAllByRole('radio');
    expect(first!.id).toBeTruthy();
    expect(first!.id).not.toBe(second!.id);
  });

  it('renders bare, with no wrapping label, when no label prop is given', () => {
    render(<Radio aria-label="Bare" />);
    expect(
      screen.getByRole('radio', { name: 'Bare' }).closest('label')
    ).toBeNull();
  });

  it('clicking the label text selects the radio', async () => {
    const user = userEvent.setup();
    render(<Radio label="Free plan" />);
    await user.click(screen.getByText('Free plan'));
    expect(screen.getByRole('radio', { name: 'Free plan' })).toBeChecked();
  });
});

describe('Radio — controlled and disabled', () => {
  it('defers to the parent when controlled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Radio name="plan" label="Pro" checked={false} onChange={onChange} />
    );
    const radio = screen.getByRole('radio', { name: 'Pro' });

    await user.click(radio);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(radio).not.toBeChecked();
  });

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Radio name="plan" label="Pro" disabled onChange={onChange} />);
    const radio = screen.getByRole('radio', { name: 'Pro' });

    expect(radio).toBeDisabled();
    await user.click(radio);
    expect(onChange).not.toHaveBeenCalled();
  });
});
