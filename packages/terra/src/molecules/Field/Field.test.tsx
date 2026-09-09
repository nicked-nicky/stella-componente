import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../../atoms/Input';
import { Field } from './Field';

function describedText(element: HTMLElement): string {
  const ids = element.getAttribute('aria-describedby')?.split(' ') ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');
}

describe('Field', () => {
  it('wires a hint to the control through aria-describedby', () => {
    render(
      <Field hint="We never share it">
        <Input aria-label="Email" />
      </Field>
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(describedText(input)).toContain('We never share it');
  });

  it('an error replaces the hint and marks the control invalid', () => {
    render(
      <Field hint="We never share it" error="Enter a valid address">
        <Input aria-label="Email" />
      </Field>
    );
    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('We never share it')).toBeNull();
    expect(describedText(input)).toContain('Enter a valid address');
  });

  it('keeps a describedby the caller had already set', () => {
    render(
      <>
        <span id="outside">Outside note</span>
        <Field hint="Hint">
          <Input aria-label="Email" aria-describedby="outside" />
        </Field>
      </>
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(describedText(input)).toContain('Outside note');
    expect(describedText(input)).toContain('Hint');
  });

  it('adds no describedby at all when there is neither hint nor error', () => {
    render(
      <Field>
        <Input aria-label="Email" />
      </Field>
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute(
      'aria-describedby'
    );
  });
});
