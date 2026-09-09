import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';

describe('Slider — track', () => {
  it('exposes a native range input carrying the scale and current value', () => {
    render(
      <Slider label="Volume" min={0} max={50} step={5} defaultValue={20} />
    );
    const track = screen.getByRole('slider', {
      name: 'Volume',
    }) as HTMLInputElement;

    expect(track).toHaveAttribute('min', '0');
    expect(track).toHaveAttribute('max', '50');
    expect(track).toHaveAttribute('step', '5');
    expect(track.value).toBe('20');
  });

  it('commits a number, not a string, when the track moves', () => {
    const onValueChange = vi.fn();
    render(
      <Slider label="Volume" defaultValue={20} onValueChange={onValueChange} />
    );

    fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), {
      target: { value: '40' },
    });
    expect(onValueChange).toHaveBeenCalledWith(40);
  });
});

describe('Slider — value editing', () => {
  it('the value readout is an editable control, not just text', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider label="Volume" defaultValue={20} onValueChange={onValueChange} />
    );

    await user.click(screen.getByRole('button', { name: /currently 20/ }));
    const editor = screen.getByRole('spinbutton');

    await user.clear(editor);
    await user.type(editor, '75{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(75);
  });

  it('Escape abandons the edit and keeps the previous value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider label="Volume" defaultValue={20} onValueChange={onValueChange} />
    );

    await user.click(screen.getByRole('button', { name: /currently 20/ }));
    const editor = screen.getByRole('spinbutton');
    await user.clear(editor);
    await user.type(editor, '75{Escape}');

    expect(onValueChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: /currently 20/ })
    ).toBeInTheDocument();
  });

  it('clamps a typed value into range rather than trusting it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider
        label="Volume"
        max={50}
        defaultValue={20}
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /currently 20/ }));
    const editor = screen.getByRole('spinbutton');
    await user.clear(editor);
    await user.type(editor, '999{Enter}');

    expect(onValueChange).toHaveBeenCalledWith(50);
  });

  it('omits the readout entirely when showValue is off', () => {
    render(<Slider label="Volume" defaultValue={20} showValue={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('a disabled slider offers no editable readout', async () => {
    const user = userEvent.setup();
    render(<Slider label="Volume" defaultValue={20} disabled />);

    const readout = screen.getByRole('button', { name: /currently 20/ });
    expect(readout).toBeDisabled();
    await user.click(readout);
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });
});
