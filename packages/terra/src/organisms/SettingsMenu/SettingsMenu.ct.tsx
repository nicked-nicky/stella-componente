import { test, expect } from '@playwright/experimental-ct-react';
import { SettingsMenuFixture } from './SettingsMenu.story';
import { checkA11y } from '../../../playwright/a11y';

test.describe('nav row states', () => {
  test('the current category stays lit whether or not it is hovered', async ({
    mount,
    page,
  }) => {
    const component = await mount(<SettingsMenuFixture />);

    const current = component.getByRole('button', { name: /General/ });
    const other = component.getByRole('button', { name: /Appearance/ });

    const atRest = await current.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(atRest).not.toBe('rgba(0, 0, 0, 0)');

    await other.hover();
    await page.waitForTimeout(250);
    const whileOtherHovered = await current.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(whileOtherHovered).toBe(atRest);
  });

  test('a resting, non-current row carries no state layer', async ({
    mount,
  }) => {
    const component = await mount(<SettingsMenuFixture />);
    const other = component.getByRole('button', { name: /Appearance/ });
    const background = await other.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(background).toBe('rgba(0, 0, 0, 0)');
  });

  test('marks the current category with aria-current, not colour alone', async ({
    mount,
  }) => {
    const component = await mount(<SettingsMenuFixture />);
    await expect(
      component.getByRole('button', { name: /General/ })
    ).toHaveAttribute('aria-current', 'true');
    await expect(
      component.getByRole('button', { name: /Appearance/ })
    ).not.toHaveAttribute('aria-current', 'true');
  });

  test('nav rows invert on keyboard focus rather than drawing an outline', async ({
    mount,
    page,
  }) => {
    const component = await mount(<SettingsMenuFixture />);
    const focused = component.getByRole('button', { name: /General/ });

    const read = () =>
      focused.evaluate((el) => {
        const s = getComputedStyle(el);
        return { background: s.backgroundColor, color: s.color };
      });

    const resting = await read();
    await page.keyboard.press('Tab');
    await expect(focused).toBeFocused();

    await expect
      .poll(async () => (await read()).background)
      .not.toBe(resting.background);
    expect((await read()).color).not.toBe(resting.color);
  });
});

test.describe('field controls', () => {
  test('switching category swaps the rendered fields', async ({ mount }) => {
    const component = await mount(<SettingsMenuFixture />);

    await expect(component.getByLabel('Display name')).toBeVisible();

    await component.getByRole('button', { name: /Appearance/ }).click();
    await expect(component.getByText('Theme')).toBeVisible();
    await expect(component.getByLabel('Display name')).toHaveCount(0);
  });

  test('a focused text field recolours its own border instead of drawing a ring', async ({
    mount,
  }) => {
    const component = await mount(<SettingsMenuFixture />);
    const field = component.getByLabel('Display name');

    const read = () =>
      field.evaluate((el) => {
        const s = getComputedStyle(el.parentElement!);
        return { border: s.borderTopColor, outlineStyle: s.outlineStyle };
      });

    const resting = await read();
    await field.focus();

    await expect
      .poll(async () => (await read()).border)
      .not.toBe(resting.border);
    expect((await read()).outlineStyle).toBe('none');
  });
});

test.describe('layout', () => {
  test('holds a fixed height instead of sizing to its content', async ({
    mount,
    page,
  }) => {
    const component = await mount(<SettingsMenuFixture />);
    const root = component.locator('> *').first();

    const before = await root.boundingBox();
    await component.getByRole('button', { name: /Appearance/ }).click();
    await expect(component.getByText('Theme')).toBeVisible();
    const after = await root.boundingBox();

    expect(before).not.toBeNull();
    expect(after!.height).toBeCloseTo(before!.height, 0);

    const viewport = page.viewportSize();
    expect(after!.height).toBeCloseTo(viewport!.height * 0.8, -1);
  });

  test('both columns scroll independently rather than the page', async ({
    mount,
  }) => {
    const component = await mount(<SettingsMenuFixture />);

    const overflow = await component
      .getByRole('navigation', { name: 'Settings categories' })
      .evaluate((el) => getComputedStyle(el).overflowY);

    expect(overflow).toBe('auto');
  });
});

test.describe('accessibility', () => {
  test('the settings surface has no axe violations', async ({
    mount,
    page,
  }) => {
    await mount(<SettingsMenuFixture />);
    await checkA11y(page);
  });

  test('the category list is exposed as a labelled navigation landmark', async ({
    mount,
  }) => {
    const component = await mount(<SettingsMenuFixture />);
    await expect(
      component.getByRole('navigation', { name: 'Settings categories' })
    ).toBeVisible();
  });
});
