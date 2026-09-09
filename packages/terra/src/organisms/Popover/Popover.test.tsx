import { describe, expect, it, vi } from 'vitest';
import { useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from '../../providers/OverlayProvider';
import { Popover } from './Popover';

function PopoverHarness({ onClose }: { onClose?: () => void }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onClose?.();
  };
  return (
    <OverlayProvider>
      <button ref={anchorRef} onClick={() => setOpen(true)}>
        Trigger
      </button>
      <Popover open={open} onClose={close} anchor={anchorRef.current}>
        <button>Inside</button>
      </Popover>
    </OverlayProvider>
  );
}

async function openPopover(onClose?: () => void) {
  const user = userEvent.setup();
  render(<PopoverHarness {...(onClose ? { onClose } : {})} />);
  await user.click(screen.getByRole('button', { name: 'Trigger' }));
  await screen.findByRole('dialog');
  return user;
}

describe('Popover', () => {
  it('renders nothing at all while closed', () => {
    render(
      <OverlayProvider>
        <Popover open={false} anchor={null}>
          <span>Body</span>
        </Popover>
      </OverlayProvider>
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('portals its content into the overlay root, not in place', async () => {
    await openPopover();
    const panel = screen.getByRole('dialog');
    expect(panel.closest('[data-stella-overlay-root]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Inside' })).toBeInTheDocument();
  });

  it('Escape closes it', async () => {
    const onClose = vi.fn();
    const user = await openPopover(onClose);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('an outside click closes it', async () => {
    const onClose = vi.fn();
    const user = await openPopover(onClose);

    await user.click(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('a click inside the panel does not close it', async () => {
    const onClose = vi.fn();
    const user = await openPopover(onClose);

    await user.click(screen.getByRole('button', { name: 'Inside' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
