import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from '../../providers/OverlayProvider';
import { Select } from './Select';

function defaultOptions() {
  return [
    <Select.Option key="us" value="us">
      United States
    </Select.Option>,
    <Select.Option key="ca" value="ca">
      Canada
    </Select.Option>,
    <Select.Option key="mx" value="mx" disabled>
      Mexico
    </Select.Option>,
  ];
}

async function openSelect(triggerName: string | RegExp) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: triggerName }));
  await screen.findByRole('menu');
  return user;
}

describe('Select — trigger', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(
      <OverlayProvider>
        <Select placeholder="Choose a country">{defaultOptions()}</Select>
      </OverlayProvider>
    );
    expect(
      screen.getByRole('button', { name: 'Choose a country' })
    ).toBeInTheDocument();
  });

  it('shows the selected option label instead of the placeholder', () => {
    render(
      <OverlayProvider>
        <Select defaultValue="ca" placeholder="Choose a country">
          {defaultOptions()}
        </Select>
      </OverlayProvider>
    );
    expect(screen.getByRole('button', { name: 'Canada' })).toBeInTheDocument();
  });

  it('exposes menu-button semantics', () => {
    render(
      <OverlayProvider>
        <Select placeholder="Choose">{defaultOptions()}</Select>
      </OverlayProvider>
    );
    const trigger = screen.getByRole('button', { name: 'Choose' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(
      <OverlayProvider>
        <Select disabled placeholder="Choose">
          {defaultOptions()}
        </Select>
      </OverlayProvider>
    );
    const trigger = screen.getByRole('button', { name: 'Choose' });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('Select — popup', () => {
  it('opens a menu listing each Select.Option as a menuitem', async () => {
    render(
      <OverlayProvider>
        <Select placeholder="Choose">{defaultOptions()}</Select>
      </OverlayProvider>
    );
    await openSelect('Choose');
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
  });

  it('sets aria-expanded once open', async () => {
    render(
      <OverlayProvider>
        <Select placeholder="Choose">{defaultOptions()}</Select>
      </OverlayProvider>
    );
    await openSelect('Choose');
    expect(screen.getByRole('button', { name: 'Choose' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('marks the currently selected option active', async () => {
    render(
      <OverlayProvider>
        <Select defaultValue="ca" placeholder="Choose">
          {defaultOptions()}
        </Select>
      </OverlayProvider>
    );
    await openSelect('Canada');
    expect(screen.getByRole('menuitem', { name: 'Canada' })).toHaveAttribute(
      'data-active',
      'true'
    );
    expect(
      screen.getByRole('menuitem', { name: 'United States' })
    ).not.toHaveAttribute('data-active');
  });

  it('an option marked disabled carries through to its menuitem', async () => {
    render(
      <OverlayProvider>
        <Select placeholder="Choose">{defaultOptions()}</Select>
      </OverlayProvider>
    );
    await openSelect('Choose');
    expect(screen.getByRole('menuitem', { name: 'Mexico' })).toBeDisabled();
  });
});

describe('Select — value contract', () => {
  it('uncontrolled: picking an option updates the trigger label itself', async () => {
    render(
      <OverlayProvider>
        <Select defaultValue="us" placeholder="Choose">
          {defaultOptions()}
        </Select>
      </OverlayProvider>
    );
    const user = await openSelect('United States');
    await user.click(screen.getByRole('menuitem', { name: 'Canada' }));
    expect(screen.getByRole('button', { name: 'Canada' })).toBeInTheDocument();
  });

  it('controlled: picking an option calls onValueChange but defers the display to the parent', async () => {
    const onValueChange = vi.fn();
    render(
      <OverlayProvider>
        <Select value="us" onValueChange={onValueChange} placeholder="Choose">
          {defaultOptions()}
        </Select>
      </OverlayProvider>
    );
    const user = await openSelect('United States');
    await user.click(screen.getByRole('menuitem', { name: 'Canada' }));
    expect(onValueChange).toHaveBeenCalledWith('ca');
    expect(
      screen.getByRole('button', { name: 'United States' })
    ).toBeInTheDocument();
  });

  it('a fully controlled parent re-render updates the trigger label', async () => {
    function Controlled() {
      const [value, setValue] = useState('us');
      return (
        <Select value={value} onValueChange={setValue} placeholder="Choose">
          {defaultOptions()}
        </Select>
      );
    }
    render(
      <OverlayProvider>
        <Controlled />
      </OverlayProvider>
    );
    const user = await openSelect('United States');
    await user.click(screen.getByRole('menuitem', { name: 'Canada' }));
    expect(screen.getByRole('button', { name: 'Canada' })).toBeInTheDocument();
  });

  it('selecting a disabled option does not commit a value', async () => {
    const onValueChange = vi.fn();
    render(
      <OverlayProvider>
        <Select onValueChange={onValueChange} placeholder="Choose">
          {defaultOptions()}
        </Select>
      </OverlayProvider>
    );
    const user = await openSelect('Choose');
    await user.click(screen.getByRole('menuitem', { name: 'Mexico' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('closes the menu after a selection', async () => {
    render(
      <OverlayProvider>
        <Select placeholder="Choose">{defaultOptions()}</Select>
      </OverlayProvider>
    );
    const user = await openSelect('Choose');
    await user.click(screen.getByRole('menuitem', { name: 'Canada' }));
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

describe('Select — label', () => {
  it('associates a provided label with the trigger via a generated id', () => {
    render(
      <OverlayProvider>
        <Select label="Country" placeholder="Choose">
          {defaultOptions()}
        </Select>
      </OverlayProvider>
    );
    expect(screen.getByRole('button', { name: /Country/ })).toBeInTheDocument();
  });

  it('renders no <label> at all when the prop is omitted', () => {
    render(
      <OverlayProvider>
        <Select aria-label="Country" placeholder="Choose">
          {defaultOptions()}
        </Select>
      </OverlayProvider>
    );
    expect(screen.queryByText('Country')).not.toBeInTheDocument();
  });
});
