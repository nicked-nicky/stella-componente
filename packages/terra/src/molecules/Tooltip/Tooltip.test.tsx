import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from '../../providers/OverlayProvider';
import { Tooltip } from './Tooltip';

function renderTooltip(props: Partial<{ disabled: boolean }> = {}) {
  return render(
    <OverlayProvider>
      <Tooltip label="Saves your work" delay={0} {...props}>
        <button>Save</button>
      </Tooltip>
    </OverlayProvider>
  );
}

describe('Tooltip', () => {
  it('is absent until the trigger is pointed at', () => {
    renderTooltip();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('appears on hover and describes the trigger', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.hover(screen.getByRole('button', { name: 'Save' }));
    const tip = await screen.findByRole('tooltip');

    expect(tip).toHaveTextContent('Saves your work');
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'aria-describedby',
      tip.id
    );
  });

  it('appears on keyboard focus, not only on hover', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('disappears again when the pointer leaves', async () => {
    const user = userEvent.setup();
    renderTooltip();
    const trigger = screen.getByRole('button', { name: 'Save' });

    await user.hover(trigger);
    await screen.findByRole('tooltip');

    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('stays out of the way entirely when disabled', async () => {
    const user = userEvent.setup();
    renderTooltip({ disabled: true });

    await user.hover(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute(
      'aria-describedby'
    );
  });
});
