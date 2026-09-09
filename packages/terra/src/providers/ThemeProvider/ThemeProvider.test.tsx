import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './ThemeProvider';

function Consumer() {
  const { config, setColorScheme, setDensity } = useTheme();
  return (
    <>
      <span data-testid="scheme">{config.colorScheme}</span>
      <button onClick={() => setColorScheme('dark')}>Go dark</button>
      <button onClick={() => setDensity('compact')}>Go compact</button>
    </>
  );
}

describe('ThemeProvider', () => {
  it('seeds its config from defaultConfig and applies it to the document', () => {
    render(
      <ThemeProvider defaultConfig={{ colorScheme: 'dark' }}>
        <Consumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('scheme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('re-renders consumers when the theme changes', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultConfig={{ colorScheme: 'light' }}>
        <Consumer />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Go dark' }));
    expect(screen.getByTestId('scheme')).toHaveTextContent('dark');
  });

  it('reports every change through onChange, not just colour-scheme ones', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ThemeProvider onChange={onChange}>
        <Consumer />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Go compact' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ density: 'compact' })
    );
  });

  it('throws a named error when useTheme is used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      /must be used within a <ThemeProvider>/
    );
    spy.mockRestore();
  });
});
