import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea — value contract', () => {
  it('accepts typed text when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, 'hello world');
    expect(textarea).toHaveValue('hello world');
  });

  it('defers to the parent when controlled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" value="fixed" onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, 'x');
    expect(onChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('fixed');
  });

  it('forwards its ref to the textarea element, not the styling wrapper', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="Notes" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

describe('Textarea — auto-grow', () => {
  it('caps its own growth at maxRows rather than growing without bound', () => {
    render(<Textarea aria-label="Notes" maxRows={4} />);
    expect(screen.getByRole('textbox', { name: 'Notes' }).style.maxHeight).toBe(
      'calc(var(--stella-text-body-lh) * 4em)'
    );
  });

  it('sets no height cap when autoGrow is off, even with maxRows', () => {
    render(<Textarea aria-label="Notes" autoGrow={false} maxRows={4} />);
    expect(screen.getByRole('textbox', { name: 'Notes' }).style.maxHeight).toBe(
      ''
    );
  });

  it('lets a caller-supplied style win over the computed cap', () => {
    render(
      <Textarea aria-label="Notes" maxRows={4} style={{ maxHeight: '10rem' }} />
    );
    expect(screen.getByRole('textbox', { name: 'Notes' }).style.maxHeight).toBe(
      '10rem'
    );
  });
});

describe('Textarea — error and label', () => {
  it('sets aria-invalid when error is set, and omits it otherwise', () => {
    const { unmount } = render(<Textarea aria-label="Notes" error />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    unmount();

    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).not.toHaveAttribute(
      'aria-invalid'
    );
  });

  it('associates a provided label via a generated id', () => {
    render(<Textarea label="Notes" />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
  });
});
