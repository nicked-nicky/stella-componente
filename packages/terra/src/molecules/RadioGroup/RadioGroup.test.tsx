import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from '../../atoms/Radio';
import { RadioGroup } from './RadioGroup';

function plans() {
  return [
    <Radio key="free" value="free" label="Free" />,
    <Radio key="pro" value="pro" label="Pro" />,
  ];
}

describe('RadioGroup', () => {
  it('hands every child one shared name, so the browser enforces exclusivity', () => {
    render(<RadioGroup legend="Plan">{plans()}</RadioGroup>);
    const [free, pro] = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(free!.name).toBeTruthy();
    expect(free!.name).toBe(pro!.name);
  });

  it('exposes the legend as the group name', () => {
    render(<RadioGroup legend="Plan">{plans()}</RadioGroup>);
    expect(screen.getByRole('group', { name: 'Plan' })).toBeInTheDocument();
  });

  it('uncontrolled: reports the child value and moves the selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        legend="Plan"
        defaultValue="free"
        onValueChange={onValueChange}
      >
        {plans()}
      </RadioGroup>
    );

    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(onValueChange).toHaveBeenCalledWith('pro');
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
  });

  it('controlled: reports the change but leaves the selection to the parent', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup legend="Plan" value="free" onValueChange={onValueChange}>
        {plans()}
      </RadioGroup>
    );

    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(onValueChange).toHaveBeenCalledWith('pro');
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
  });

  it('disabling the group disables every child', () => {
    render(
      <RadioGroup legend="Plan" disabled>
        {plans()}
      </RadioGroup>
    );
    screen
      .getAllByRole('radio')
      .forEach((radio) => expect(radio).toBeDisabled());
  });
});
