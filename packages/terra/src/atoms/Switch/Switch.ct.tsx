import { test, expect } from '@playwright/experimental-ct-react';
import { Switch } from './Switch';

test('off-track color differs between two grades at rest', async ({
  mount,
}) => {
  const component = await mount(
    <div>
      <Switch aria-label="A" grade="global" />
      <Switch aria-label="B" grade="elevated" />
    </div>
  );

  const colorOf = (name: string) =>
    component
      .getByRole('switch', { name })
      .evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(await colorOf('A')).not.toBe(await colorOf('B'));
});

test('hover and press escalate the off-track a tier further each', async ({
  mount,
  page,
}) => {
  await mount(<Switch aria-label="Notifications" />);
  const el = page.getByRole('switch', { name: 'Notifications' });
  const color = () => el.evaluate((e) => getComputedStyle(e).backgroundColor);

  const resting = await color();
  await el.hover();
  await expect.poll(color).not.toBe(resting);
  const hovered = await color();

  await page.mouse.down();
  try {
    await expect.poll(color).not.toBe(hovered);
  } finally {
    await page.mouse.up();
  }
});

test('checked stays on the fixed on-fill regardless of grade, hover, or press', async ({
  mount,
  page,
}) => {
  await mount(
    <Switch aria-label="Notifications" grade="elevated" defaultChecked />
  );
  const el = page.getByRole('switch', { name: 'Notifications' });

  const checkedColor = await el.evaluate(
    (e) => getComputedStyle(e).backgroundColor
  );
  await el.hover();

  await expect
    .poll(() => el.evaluate((e) => getComputedStyle(e).backgroundColor))
    .toBe(checkedColor);
});

test('keyboard focus inverts the track and thumb rather than drawing an outline', async ({
  mount,
  page,
}) => {
  await mount(<Switch aria-label="Notifications" />);
  const el = page.getByRole('switch', { name: 'Notifications' });

  const read = () =>
    el.evaluate((node) => ({
      track: getComputedStyle(node).backgroundColor,
      thumb: getComputedStyle(node.firstElementChild as Element)
        .backgroundColor,
      outlineStyle: getComputedStyle(node).outlineStyle,
    }));

  const resting = await read();
  await page.keyboard.press('Tab');
  await expect(el).toBeFocused();

  await expect.poll(async () => (await read()).track).not.toBe(resting.track);

  const focused = await read();
  expect(focused.thumb).not.toBe(resting.thumb);
  expect(focused.outlineStyle).toBe('none');
});
