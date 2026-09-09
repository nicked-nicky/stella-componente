import { test, expect } from '@playwright/experimental-ct-react';
import { Radio } from './Radio';

test('unchecked Radio has a visible border and background at rest', async ({
  mount,
}) => {
  const component = await mount(<Radio aria-label="Option" />);
  const radio = component.getByRole('radio');

  const [borderColor, backgroundColor] = await Promise.all([
    radio.evaluate(
      (el) => getComputedStyle(el.nextElementSibling as Element).borderColor
    ),
    radio.evaluate(
      (el) => getComputedStyle(el.nextElementSibling as Element).backgroundColor
    ),
  ]);

  expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
});

test('hover escalates both background and border a tier further', async ({
  mount,
}) => {
  const component = await mount(<Radio aria-label="Option" />);
  const radio = component.getByRole('radio');
  const dot = () =>
    radio.evaluate((el) => {
      const cs = getComputedStyle(el.nextElementSibling as Element);
      return `${cs.backgroundColor}|${cs.borderColor}`;
    });

  const resting = await dot();
  await radio.hover();

  await expect.poll(dot).not.toBe(resting);
});

test('press escalates a tier further than hover', async ({ mount, page }) => {
  const component = await mount(<Radio aria-label="Option" />);
  const radio = component.getByRole('radio');
  const dot = () =>
    radio.evaluate((el) => {
      const cs = getComputedStyle(el.nextElementSibling as Element);
      return `${cs.backgroundColor}|${cs.borderColor}`;
    });

  const resting = await dot();
  await radio.hover();
  await expect.poll(dot).not.toBe(resting);
  const hovered = await dot();

  await page.mouse.down();
  try {
    await expect.poll(dot).not.toBe(hovered);
  } finally {
    await page.mouse.up();
  }
});

test('checked Radio reads its fill from the grade, like every other tier', async ({
  mount,
}) => {
  const component = await mount(
    <div>
      <Radio aria-label="A" grade="global" defaultChecked />
      <Radio aria-label="B" grade="elevated" defaultChecked />
    </div>
  );

  const colorOf = (name: string) =>
    component
      .getByRole('radio', { name })
      .evaluate(
        (el) =>
          getComputedStyle(el.nextElementSibling as Element).backgroundColor
      );

  expect(await colorOf('A')).not.toBe(await colorOf('B'));
});

test('keyboard focus inverts the dot rather than drawing an outline', async ({
  mount,
  page,
}) => {
  const component = await mount(<Radio aria-label="Option" />);
  const radio = component.getByRole('radio');
  const dot = () =>
    radio.evaluate((el) => {
      const el2 = el.nextElementSibling as Element;
      return {
        background: getComputedStyle(el2).backgroundColor,
        mark: getComputedStyle(el2, '::after').backgroundColor,
      };
    });

  const resting = await dot();
  await page.keyboard.press('Tab');
  await expect(radio).toBeFocused();

  await expect
    .poll(async () => (await dot()).background)
    .not.toBe(resting.background);
  expect((await dot()).mark).not.toBe(resting.mark);
});
