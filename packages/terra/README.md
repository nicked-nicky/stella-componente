# @stella-componente/terra

[![npm](https://img.shields.io/npm/v/@stella-componente/terra?label=npm&color=df3020&labelColor=8a1a0f)](https://www.npmjs.com/package/@stella-componente/terra)
[![License](https://img.shields.io/badge/License-MIT-237ad7?labelColor=17518f)](./LICENSE)
[![Runtime-deps](https://img.shields.io/badge/Runtime--deps-ZERO!-90cb10?labelColor=6c990d)](#zero-runtime-dependencies)

A React-first, runtime-agnostic UI kit with a GTK 4 / libadwaita-inspired visual identity — built for fast, native-feeling desktop apps (Tauri, Electron, or any webview), and just as usable on the web.

> **Alpha.** The component set is complete enough to build a real app against, but this is pre-1.0 and the API is still allowed to move. Pin an exact version if that matters to you.

## Install

```bash
npm install @stella-componente/terra@alpha
# or: pnpm add @stella-componente/terra@alpha
```

React 18 or 19 is a peer dependency. That's the only peer — Terra brings no icon set of its own; feed `Icon` whatever SVG/icon component you already use.

## Quick start

Import the design tokens once, at your app entry. Nothing renders correctly without them — every component reads its colours, spacing and radii from these custom properties.

```tsx
import "@stella-componente/terra/styles/tokens.css";
```

Then wrap your app in the providers you actually need. All three are optional and independent:

```tsx
import {
	ThemeProvider,
	OverlayProvider,
	NotificationProvider,
	ButtonIsland,
	Button,
} from "@stella-componente/terra";

export function App() {
	return (
		<ThemeProvider>
			<OverlayProvider>
				<NotificationProvider>
					<ButtonIsland>
						<Button>Save</Button>
						<Button>Cancel</Button>
					</ButtonIsland>
				</NotificationProvider>
			</OverlayProvider>
		</ThemeProvider>
	);
}
```

`ThemeProvider` for theming, `OverlayProvider` for `Dialog`/`Menu`/`Popover` stacking and Escape scoping, `NotificationProvider` for toasts (and for `Code`'s copy-to-clipboard feedback). Everything else works without any of them.

> **One hard rule:** every `Button` renders inside a `ButtonIsland` — there's no supported bare-button usage. `ButtonIsland` groups buttons, draws the shared hairline between adjacent ones, and is the building block behind toolbars, icon-only clusters, selection rows, tab rows, and sidebars alike.

## What's in it

40 components across atoms, molecules, organisms and layout primitives, plus the three providers above — `Avatar`, `Badge`, `Button`, `Checkbox`, `Code`, `Divider`, `Icon`, `Input`, `Island`, `Kbd`, `Link`, `Progress`, `Radio`, `Skeleton`, `Slider`, `Spinner`, `Switch`, `Text`, `Textarea`, `FlexContainer`, `ScrollArea`, `Alert`, `Breadcrumbs`, `ButtonIsland`, `Card`, `CheckboxGroup`, `Field`, `Notification`, `RadioGroup`, `SearchField`, `Select`, `Tooltip`, `WindowControls`, `Dialog`, `EmptyState`, `List`, `Menu`, `Popover`, `SettingsMenu`, `WindowChrome`.

Full component reference, architecture notes and the theming API live in the [repository README](https://github.com/nicked-nicky/stella-componente#readme).

## Theming

Five independent axes, each written to the document root as a CSS custom property — change one and everything reading it updates with no React re-render:

| Axis          | Values                                |
| ------------- | ------------------------------------- |
| `colorScheme` | `light` / `dark` / `system`           |
| `radius`      | `sharp` / `default` / `round`         |
| `density`     | `compact` / `default` / `comfortable` |
| `borderWidth` | `none` / `thin` / `default` / `thick` |
| `motion`      | `system` / `reduced` / `off`          |

There is deliberately no accent hue: Stella-Componente has a single neutral colour scheme, and colour is reserved for five status meanings (success / info / warning / error / debug).

Separately, surfaces (`Island`, `Card`, and the overlay organisms) carry a `grade` (`'global' | 'default' | 'elevated'`) rather than a fixed tone. Leave it unset and a nested surface escalates one step above its parent automatically — set it explicitly to override.

Persistence is your job — `ThemeProvider`'s `onChange` hands you a plain serialisable config to save wherever your runtime saves things (Tauri's fs plugin, Electron IPC, `localStorage`).

## Zero runtime dependencies

Terra ships no runtime dependencies at all. Styling is CSS Modules with design tokens, so there is no runtime CSS-in-JS and no style recalculation on theme change. Output is unbundled — `tsc` compiles `src/` to `dist/` 1:1 with the CSS copied alongside — so your bundler tree-shakes it directly. `scripts/measure-treeshake.mjs` bundles synthetic single-component entrypoints to keep that claim honest; rerun it rather than trusting a stale number in a README.

Because the output uses extensionless relative imports, it needs a bundler (Vite, webpack, Next, any Tauri/Electron frontend). Running it under plain Node ESM won't work.

## Roadmap

Two more packages are planned, both currently unbuilt: `@stella-componente/esterno` (external tooling — theme settings save/load, a TS-native function plus an IPC-based one for Tauri/Electron, and a mechanism to swap the active CSS file) and `@stella-componente/bellezza` (an Appearance-menu upgrade plus a set of built-in CSS color schemes modeled on popular themes). See the [repository README](https://github.com/nicked-nicky/stella-componente#readme) for the full picture.

## Browser support

Baseline 2024: Chrome 123+, Edge 123+, Safari 17.5+, Firefox 120+, WebKitGTK 2.44+. The floor comes from `light-dark()`, `:has()` and `color-scheme`, which the theming and interaction layers rely on. For Tauri on Linux this is worth checking, since it uses the system WebKitGTK.

## License

MIT — see [LICENSE](./LICENSE).
