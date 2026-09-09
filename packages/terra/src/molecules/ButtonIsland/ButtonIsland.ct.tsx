import { test, expect } from '@playwright/experimental-ct-react';
import type { Locator } from '@playwright/test';
import { ButtonIsland } from './ButtonIsland';
import { Button } from '../../atoms/Button';
import { Tooltip } from '../Tooltip';
import { OverlayProvider } from '../../providers/OverlayProvider';

test.describe('divider borders', () => {
  test('the seam between two buttons is painted at rest', async ({ mount }) => {
    const component = await mount(
      <ButtonIsland>
        <Button>Left</Button>
        <Button>Right</Button>
      </ButtonIsland>
    );

    const seam = await component
      .getByRole('button', { name: 'Left' })
      .evaluate((el) => getComputedStyle(el).borderRightColor);

    expect(seam).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('the seam escalates on hover', async ({ mount }) => {
    const component = await mount(
      <ButtonIsland>
        <Button>Left</Button>
        <Button>Right</Button>
      </ButtonIsland>
    );

    const left = component.getByRole('button', { name: 'Left' });
    const resting = await left.evaluate(
      (el) => getComputedStyle(el).borderRightColor
    );

    await left.hover();

    await expect
      .poll(() => left.evaluate((el) => getComputedStyle(el).borderRightColor))
      .not.toBe(resting);
  });

  test('outer edges stay collapsed, even while pressed', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <ButtonIsland>
        <Button>Left</Button>
        <Button>Right</Button>
      </ButtonIsland>
    );

    const left = component.getByRole('button', { name: 'Left' });
    const right = component.getByRole('button', { name: 'Right' });
    const transparent = 'rgba(0, 0, 0, 0)';

    expect(
      await left.evaluate((el) => getComputedStyle(el).borderLeftColor)
    ).toBe(transparent);
    expect(
      await right.evaluate((el) => getComputedStyle(el).borderRightColor)
    ).toBe(transparent);

    await left.hover();
    await page.mouse.down();
    try {
      await expect
        .poll(() => left.evaluate((el) => getComputedStyle(el).borderLeftColor))
        .toBe(transparent);
    } finally {
      await page.mouse.up();
    }
  });
});

test('outer Island border changes color on button hover', async ({ mount }) => {
  const component = await mount(
    <ButtonIsland>
      <Button>Left</Button>
      <Button>Right</Button>
    </ButtonIsland>
  );

  const island = component;
  const restingColor = await island.evaluate(
    (el) => getComputedStyle(el).borderColor
  );

  await component.getByRole('button', { name: 'Left' }).hover();

  await expect
    .poll(() => island.evaluate((el) => getComputedStyle(el).borderColor))
    .not.toBe(restingColor);
});

test.describe('size/grade inheritance', () => {
  test("a direct Button child inherits its island's grade", async ({
    mount,
  }) => {
    const component = await mount(
      <div>
        <ButtonIsland grade="elevated">
          <Button>Elevated child</Button>
        </ButtonIsland>
        <ButtonIsland grade="global">
          <Button>Global child</Button>
        </ButtonIsland>
      </div>
    );

    const hoverBackground = async (button: Locator) => {
      const read = () =>
        button.evaluate((el) => getComputedStyle(el).backgroundColor);
      const resting = await read();
      await button.hover();
      await expect.poll(read).not.toBe(resting);
      return read();
    };

    const elevatedHover = await hoverBackground(
      component.getByRole('button', { name: 'Elevated child' })
    );
    const globalHover = await hoverBackground(
      component.getByRole('button', { name: 'Global child' })
    );

    expect(elevatedHover).not.toBe(globalHover);
  });

  test("a Button's own explicit grade overrides the island's default", async ({
    mount,
  }) => {
    const component = await mount(
      <ButtonIsland grade="elevated">
        <Button>Inherits elevated</Button>
        <Button grade="global">Explicit global</Button>
      </ButtonIsland>
    );

    const inherited = component.getByRole('button', {
      name: 'Inherits elevated',
    });
    const explicit = component.getByRole('button', { name: 'Explicit global' });

    const inheritedResting = await inherited.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    const explicitResting = await explicit.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );

    await inherited.hover();
    await explicit.hover();

    await expect
      .poll(() =>
        inherited.evaluate((el) => getComputedStyle(el).backgroundColor)
      )
      .not.toBe(inheritedResting);
    await expect
      .poll(() =>
        explicit.evaluate((el) => getComputedStyle(el).backgroundColor)
      )
      .not.toBe(explicitResting);

    const inheritedColor = await inherited.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    const explicitColor = await explicit.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(explicitColor).not.toBe(inheritedColor);
  });

  test('a Button wrapped in a single-child decorator like Tooltip still inherits the grade', async ({
    mount,
  }) => {
    const component = await mount(
      <OverlayProvider>
        <ButtonIsland grade="elevated">
          <Tooltip label="Wrapped">
            <Button iconOnly aria-label="Wrapped">
              W
            </Button>
          </Tooltip>
        </ButtonIsland>
      </OverlayProvider>
    );

    await expect(
      component.getByRole('button', { name: 'Wrapped' })
    ).toHaveAttribute('data-stella-grade', 'elevated');
  });
});

test.describe('single-button stretch', () => {
  test('a lone button fills an Island that has been widened', async ({
    mount,
  }) => {
    const component = await mount(
      <ButtonIsland style={{ width: 400 }}>
        <Button>New note</Button>
      </ButtonIsland>
    );

    const islandBox = await component.boundingBox();
    const buttonBox = await component
      .getByRole('button', { name: 'New note' })
      .boundingBox();

    expect(islandBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.width).toBeGreaterThan(islandBox!.width - 8);
  });

  test('a lone button in an un-widened Island stays at content width', async ({
    mount,
  }) => {
    const component = await mount(
      <ButtonIsland>
        <Button>New note</Button>
      </ButtonIsland>
    );

    const box = await component.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThan(200);
  });

  test('a multi-button Island still lays its buttons out at content width', async ({
    mount,
  }) => {
    const component = await mount(
      <ButtonIsland style={{ width: 400 }}>
        <Button>Cancel</Button>
        <Button>Save</Button>
      </ButtonIsland>
    );

    const cancel = await component
      .getByRole('button', { name: 'Cancel' })
      .boundingBox();

    expect(cancel).not.toBeNull();
    expect(cancel!.width).toBeLessThan(200);
  });
});
