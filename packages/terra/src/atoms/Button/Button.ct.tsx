import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';
import { ButtonIsland } from '../../molecules/ButtonIsland';
import { checkA11y } from '../../../playwright/a11y';

async function token(page: import('@playwright/test').Page, name: string) {
  return page.evaluate(
    (n) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name
  );
}

async function settle(page: import('@playwright/test').Page) {
  await page.waitForTimeout(250);
}

test.describe('grade ladder', () => {
  test('press steps firmer than hover, and selected is its own fixed fill', async ({
    mount,
    page,
  }) => {
    await mount(
      <ButtonIsland>
        <Button>Save</Button>
      </ButtonIsland>
    );

    const hover = await token(page, '--stella-surface-3');
    const active = await token(page, '--stella-surface-4');
    const selected = await token(page, '--stella-selected');

    expect(hover).not.toBe('');
    expect(active).not.toBe(hover);
    expect(selected).not.toBe('');
  });

  test('the fill ladder and the hairline ladder stay distinct', async ({
    mount,
    page,
  }) => {
    await mount(
      <ButtonIsland>
        <Button>Save</Button>
      </ButtonIsland>
    );

    const surfaceResting = await token(page, '--stella-surface-3');
    const borderHover = await token(page, '--stella-border-4');
    const borderActive = await token(page, '--stella-border-5');

    expect(borderHover).not.toBe('');
    expect(borderHover).not.toBe(surfaceResting);
    expect(borderActive).not.toBe(borderHover);
  });

  test('rest state carries no surface of its own', async ({ mount }) => {
    const component = await mount(
      <ButtonIsland>
        <Button>Save</Button>
      </ButtonIsland>
    );
    const button = component.getByRole('button', { name: 'Save' });
    const background = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(background).toBe('rgba(0, 0, 0, 0)');
  });

  test('hover paints a state layer and brightens the label', async ({
    mount,
  }) => {
    const component = await mount(
      <ButtonIsland>
        <Button>Save</Button>
      </ButtonIsland>
    );
    const button = component.getByRole('button', { name: 'Save' });

    const restColor = await button.evaluate((el) => getComputedStyle(el).color);
    await button.hover();

    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe('rgba(0, 0, 0, 0)');
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).color))
      .not.toBe(restColor);
  });

  test('press escalates beyond hover rather than repeating it', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <ButtonIsland>
        <Button>Save</Button>
      </ButtonIsland>
    );
    const button = component.getByRole('button', { name: 'Save' });

    const read = () =>
      button.evaluate((el) => getComputedStyle(el).backgroundColor);

    await button.hover();
    await expect.poll(read).not.toBe('rgba(0, 0, 0, 0)');
    const hoverBackground = await read();

    await page.mouse.down();
    await expect.poll(read).not.toBe(hoverBackground);
    await page.mouse.up();
  });

  test('the selected state out-specifies hover, so it does not flicker while hovered', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <ButtonIsland>
        <Button active>Editor</Button>
      </ButtonIsland>
    );
    const button = component.getByRole('button', { name: 'Editor' });

    const restBackground = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    await button.hover();
    await settle(page);
    const hoverBackground = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );

    expect(hoverBackground).toBe(restBackground);
  });

  test('a selected button is lit at rest, where an unselected one is not', async ({
    mount,
  }) => {
    const component = await mount(
      <ButtonIsland>
        <Button active>Editor</Button>
        <Button>Settings</Button>
      </ButtonIsland>
    );

    const selectedBackground = await component
      .getByRole('button', { name: 'Editor' })
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const plainBackground = await component
      .getByRole('button', { name: 'Settings' })
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(plainBackground).toBe('rgba(0, 0, 0, 0)');
    expect(selectedBackground).not.toBe(plainBackground);
  });

  test('a disabled button does not respond to hover', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <ButtonIsland>
        <Button disabled>Save</Button>
      </ButtonIsland>
    );
    const button = component.getByRole('button', { name: 'Save' });

    const restBackground = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    await button.hover({ force: true });
    await settle(page);
    const hoverBackground = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );

    expect(hoverBackground).toBe(restBackground);
  });
});

test.describe('focus fill', () => {
  test('keyboard focus inverts the button instead of drawing an outline', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <ButtonIsland>
        <Button>Save</Button>
      </ButtonIsland>
    );
    const button = component.getByRole('button', { name: 'Save' });

    const read = () =>
      button.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          background: s.backgroundColor,
          color: s.color,
          outlineStyle: s.outlineStyle,
        };
      });

    const resting = await read();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();

    await expect
      .poll(async () => (await read()).background)
      .not.toBe(resting.background);

    const focused = await read();
    expect(focused.color).not.toBe(resting.color);
    expect(focused.background).not.toBe(focused.color);
    expect(focused.outlineStyle).toBe('none');
  });
});

test.describe('accessibility', () => {
  test('a button group has no axe violations', async ({ mount, page }) => {
    await mount(
      <ButtonIsland>
        <Button active>Editor</Button>
        <Button>Settings</Button>
      </ButtonIsland>
    );
    await checkA11y(page);
  });

  test('an icon-only button still exposes an accessible name', async ({
    mount,
    page,
  }) => {
    await mount(
      <ButtonIsland>
        <Button iconOnly aria-label="Close">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" fill="none" />
          </svg>
        </Button>
      </ButtonIsland>
    );
    await checkA11y(page);
  });
});
