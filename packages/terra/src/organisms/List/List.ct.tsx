import { test, expect } from '@playwright/experimental-ct-react';
import { List } from './List';
import { checkA11y } from '../../../playwright/a11y';

const fixture = (
  <List aria-label="Files" defaultValue="b">
    <List.Item value="a">Alpha</List.Item>
    <List.Item value="b">Beta</List.Item>
    <List.Item value="c">Gamma</List.Item>
  </List>
);

test('the list draws its own border and surface', async ({ mount }) => {
  const component = await mount(fixture);
  const [borderTopWidth, borderColor, backgroundColor] =
    await component.evaluate((el) => {
      const cs = getComputedStyle(el);
      return [cs.borderTopWidth, cs.borderTopColor, cs.backgroundColor];
    });

  expect(borderTopWidth).not.toBe('0px');
  expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
});

test('rows are separated by a seam, the first row is not', async ({
  mount,
}) => {
  const component = await mount(fixture);
  const options = component.getByRole('option');

  const first = await options
    .nth(0)
    .evaluate((el) => getComputedStyle(el).borderTopWidth);
  const second = await options
    .nth(1)
    .evaluate((el) => getComputedStyle(el).borderTopWidth);

  expect(first).toBe('0px');
  expect(second).not.toBe('0px');
});

test('the selected row stands apart from the list surface', async ({
  mount,
}) => {
  const component = await mount(fixture);
  const listBg = await component.evaluate(
    (el) => getComputedStyle(el).backgroundColor
  );
  const selectedBg = await component
    .getByRole('option', { name: 'Beta' })
    .evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(selectedBg).not.toBe(listBg);
});

test('focus fill wins over hover on the selected row', async ({
  mount,
  page,
}) => {
  const component = await mount(fixture);
  const selected = component.getByRole('option', { name: 'Beta' });
  const bg = () =>
    selected.evaluate((el) => getComputedStyle(el).backgroundColor);

  const resting = await bg();
  await page.keyboard.press('Tab');
  await expect(selected).toBeFocused();
  await expect.poll(bg).not.toBe(resting);
  await page.waitForTimeout(250);
  const focused = await bg();

  await selected.hover();
  await page.waitForTimeout(250);
  expect(await bg()).toBe(focused);
});

test('is accessible', async ({ mount, page }) => {
  await mount(fixture);
  await checkA11y(page);
});
