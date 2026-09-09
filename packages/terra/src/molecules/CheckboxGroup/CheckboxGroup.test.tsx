import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../../atoms/Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

function toppings() {
  return [
    <Checkbox key="olives" value="olives" label="Olives" />,
    <Checkbox key="basil" value="basil" label="Basil" />,
  ];
}

describe('CheckboxGroup', () => {
  it('exposes the legend as the group name', () => {
    render(<CheckboxGroup legend="Toppings">{toppings()}</CheckboxGroup>);
    expect(screen.getByRole('group', { name: 'Toppings' })).toBeInTheDocument();
  });

  it('reports the full selection, not just the box that changed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup
        legend="Toppings"
        defaultValue={['olives']}
        onValueChange={onValueChange}
      >
        {toppings()}
      </CheckboxGroup>
    );

    await user.click(screen.getByRole('checkbox', { name: 'Basil' }));
    expect(onValueChange).toHaveBeenCalledWith(['olives', 'basil']);
  });

  it('unchecking removes only that value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup
        legend="Toppings"
        defaultValue={['olives', 'basil']}
        onValueChange={onValueChange}
      >
        {toppings()}
      </CheckboxGroup>
    );

    await user.click(screen.getByRole('checkbox', { name: 'Olives' }));
    expect(onValueChange).toHaveBeenCalledWith(['basil']);
  });

  it('controlled: leaves the checked state to the parent', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup
        legend="Toppings"
        value={['olives']}
        onValueChange={onValueChange}
      >
        {toppings()}
      </CheckboxGroup>
    );

    await user.click(screen.getByRole('checkbox', { name: 'Basil' }));
    expect(onValueChange).toHaveBeenCalledWith(['olives', 'basil']);
    expect(screen.getByRole('checkbox', { name: 'Basil' })).not.toBeChecked();
  });

  it('disabling the group disables every child', () => {
    render(
      <CheckboxGroup legend="Toppings" disabled>
        {toppings()}
      </CheckboxGroup>
    );
    screen
      .getAllByRole('checkbox')
      .forEach((box) => expect(box).toBeDisabled());
  });
});
