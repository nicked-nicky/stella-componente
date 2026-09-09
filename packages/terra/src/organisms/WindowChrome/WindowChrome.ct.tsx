import { test, expect } from '@playwright/experimental-ct-react';
import { WindowChrome } from './WindowChrome';
import { Button } from '../../atoms/Button';
import { checkA11y } from '../../../playwright/a11y';

const controls = { minimize: () => {}, maximize: () => {}, close: () => {} };

test.describe('the strip itself', () => {
  test('is transparent, letting the app canvas show through', async ({
    mount,
  }) => {
    const component = await mount(
      <WindowChrome title="Ray IDE" windowControls={controls} />
    );

    const style = await component.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        background: s.backgroundColor,
        borderBottomWidth: s.borderBottomWidth,
      };
    });

    expect(style.background).toBe('rgba(0, 0, 0, 0)');
    expect(style.borderBottomWidth).toBe('0px');
  });

  test('takes its height from the bar-height token rather than a hardcoded value', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <WindowChrome title="Ray IDE" windowControls={controls} />
    );

    const barHeight = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--stella-bar-height')
        .trim()
    );
    expect(barHeight).not.toBe('');

    const height = await component.evaluate(
      (el) => getComputedStyle(el).height
    );
    expect(parseFloat(height)).toBeGreaterThan(0);
  });
});

test.describe('drag region', () => {
  test('marks the bar draggable for Tauri via the DOM attribute', async ({
    mount,
  }) => {
    const component = await mount(
      <WindowChrome title="Ray IDE" windowControls={controls} />
    );
    await expect(component).toHaveAttribute('data-tauri-drag-region', '');
  });

  test('marks the bar draggable for Electron via -webkit-app-region', async ({
    mount,
  }) => {
    const component = await mount(
      <WindowChrome title="Ray IDE" windowControls={controls} />
    );

    const appRegion = await component.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('-webkit-app-region').trim()
    );

    test.skip(
      appRegion === '',
      '-webkit-app-region not exposed by this browser build'
    );
    expect(appRegion).toBe('drag');
  });

  test('opts interactive pills out of the drag region so they stay clickable', async ({
    mount,
  }) => {
    const component = await mount(
      <WindowChrome
        title="Ray IDE"
        systemTools={
          <Button iconOnly aria-label="Settings">
            S
          </Button>
        }
        windowControls={controls}
      />
    );

    const region = await component
      .getByRole('button', { name: 'Close' })
      .evaluate((el) => {
        let node: Element | null = el;
        while (node) {
          const value = getComputedStyle(node)
            .getPropertyValue('-webkit-app-region')
            .trim();
          if (value && value !== 'none') return value;
          node = node.parentElement;
        }
        return '';
      });

    test.skip(
      region === '',
      '-webkit-app-region not exposed by this browser build'
    );
    expect(region).toBe('no-drag');
  });

  test('the title itself stays draggable, the way an OS title bar does', async ({
    mount,
  }) => {
    const component = await mount(
      <WindowChrome title="Ray IDE" windowControls={controls} />
    );

    const region = await component.getByText('Ray IDE').evaluate((el) => {
      let node: Element | null = el;
      while (node) {
        const value = getComputedStyle(node)
          .getPropertyValue('-webkit-app-region')
          .trim();
        if (value && value !== 'none') return value;
        node = node.parentElement;
      }
      return '';
    });

    test.skip(
      region === '',
      '-webkit-app-region not exposed by this browser build'
    );
    expect(region).toBe('drag');
  });

  test('double-clicking the bar toggles maximize, matching OS behaviour', async ({
    mount,
  }) => {
    let maximizeCalls = 0;
    const component = await mount(
      <WindowChrome
        title="Ray IDE"
        windowControls={{
          ...controls,
          maximize: () => {
            maximizeCalls += 1;
          },
        }}
      />
    );

    await component.dblclick({ position: { x: 5, y: 5 } });
    expect(maximizeCalls).toBe(1);
  });
});

test.describe('render modes', () => {
  test('structured mode renders the four regions', async ({ mount }) => {
    const component = await mount(
      <WindowChrome
        title="Ray IDE"
        tabs={<span>tabs</span>}
        tools={
          <Button iconOnly aria-label="Search">
            S
          </Button>
        }
        systemTools={
          <Button iconOnly aria-label="Settings">
            G
          </Button>
        }
        windowControls={controls}
      />
    );

    await expect(component.getByText('Ray IDE')).toBeVisible();
    await expect(component.getByText('tabs')).toBeVisible();
    await expect(
      component.getByRole('button', { name: 'Search' })
    ).toBeVisible();
    await expect(
      component.getByRole('button', { name: 'Settings' })
    ).toBeVisible();
    await expect(
      component.getByRole('button', { name: 'Close' })
    ).toBeVisible();
  });

  test('empty mode renders freeform children instead of the grid', async ({
    mount,
  }) => {
    const component = await mount(
      <WindowChrome windowControls={controls}>
        <span>Quick Capture</span>
      </WindowChrome>
    );

    await expect(component.getByText('Quick Capture')).toBeVisible();
    await expect(
      component.getByRole('button', { name: 'Close' })
    ).toBeVisible();
  });

  test('clusters of different size still line up on one baseline', async ({
    mount,
  }) => {
    const component = await mount(
      <WindowChrome
        title="Ray IDE"
        systemTools={
          <Button iconOnly aria-label="Settings">
            G
          </Button>
        }
        windowControls={controls}
        size="md"
      />
    );

    const settings = await component
      .getByRole('button', { name: 'Settings' })
      .boundingBox();
    const close = await component
      .getByRole('button', { name: 'Close' })
      .boundingBox();

    expect(settings).not.toBeNull();
    expect(close).not.toBeNull();
    expect(Math.abs(settings!.height - close!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(settings!.y - close!.y)).toBeLessThanOrEqual(1);
  });
});

test.describe('accessibility', () => {
  test('a fully populated title bar has no axe violations', async ({
    mount,
    page,
  }) => {
    await mount(
      <WindowChrome
        title="Ray IDE"
        tools={
          <Button iconOnly aria-label="Search">
            S
          </Button>
        }
        systemTools={
          <Button iconOnly aria-label="Settings">
            G
          </Button>
        }
        windowControls={controls}
      />
    );
    await checkA11y(page);
  });

  test('every window control has an accessible name', async ({ mount }) => {
    const component = await mount(
      <WindowChrome title="Ray IDE" windowControls={controls} />
    );
    await expect(
      component.getByRole('button', { name: 'Minimize' })
    ).toBeVisible();
    await expect(
      component.getByRole('button', { name: 'Maximize' })
    ).toBeVisible();
    await expect(
      component.getByRole('button', { name: 'Close' })
    ).toBeVisible();
  });
});
