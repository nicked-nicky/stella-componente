# Stella-Componente

[![CI](https://img.shields.io/github/actions/workflow/status/nicked-nicky/stella-componente/ci.yml?branch=alpha&label=CI&color=22a8c3&labelColor=126b7d)](https://github.com/nicked-nicky/stella-componente/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@stella-componente/terra?label=npm&color=df3020&labelColor=8a1a0f)](https://www.npmjs.com/package/@stella-componente/terra)
[![Status](https://img.shields.io/badge/status-alpha-e67d37?labelColor=934612)](#getting-started)
[![License](https://img.shields.io/badge/License-MIT-237ad7?labelColor=17518f)](./LICENSE)
[![Runtime-deps](https://img.shields.io/badge/Runtime--deps-ZERO!-90cb10?labelColor=6c990d)](./packages/terra/package.json)

## Overview

Stella is a **React-first** UI kit inspired by **GTK 4** and **Libadwaita**. It's under active development, meant to stay light and thin while looking genuinely good — giving desktop apps built with **Tauri** or **Electron** a native feel without tying the design system to either runtime.

Stella is runtime-agnostic and zero-dependency, and it doesn't stop at styled components: overlays, notifications, dialogs and tooltips are built in as thin, dependency-free app-level systems, not just visual atoms. The goal is for Stella to be the fastest path to a consistent, opinionated desktop UI — everywhere a webview runs.

## Design Language

Stella is built for segmented UIs that lean heavily on **islands** as the main way to separate an interface into chunks. Three conventions fall out of that:

**Separate controls from data.** Building a text editor? Push the control buttons into their own island rather than letting them float over the content. Bundle the viewport and its controls together with `FlexContainer` so the pairing is structural, not incidental.

**Limited nesting depth.** Stella has three levels of nesting — called **grades** — thought through from the start:

| Grade      | Depth   | Rule                                                                             |
| ---------- | ------- | -------------------------------------------------------------------------------- |
| `global`   | Lowest  | Any `global`-grade component must contain an element of a higher grade.          |
| `default`  | Middle  | The everyday grade — most components sit here.                                   |
| `elevated` | Deepest | Shouldn't contain anything with a surface of its own. This is as deep as you go. |

A component doesn't have to pick its own grade by hand — leave `grade` unset on a nested `Island`/`Card` and it escalates one step above its parent automatically. The constraint is deliberate: a shallow, forced hierarchy pushes you toward _separating_ elements with islands instead of stacking surfaces indefinitely.

**Buttons cannot be placed outside `ButtonIsland`. That's a constant.** `ButtonIsland` is the universal way to use buttons in Stella — it groups them, draws the shared hairlines between adjacent buttons carefully, and takes its visual cues directly from GTK/Adwaita's linked-button-group convention (going back to GTK 3's tab buttons). `ButtonIsland` + `Button` together cover far more ground than that description implies: context menus, icon-only toolbars, selection rows, tab rows, and sidebars all come out of the same pairing. See [WIKI.md](./WIKI.md#buttons--buttonisland) for the props and worked examples.

## Packages

### `@stella-componente/terra`

The quintessence of Stella — the base package, and the one that's actually usable today. It ships a full set of components for building a desktop application's UI, organized atomic-design-style (`atoms/` → `molecules/` → `organisms/` → layout primitives), plus three app-level providers for theming, overlay stacking, and notifications.

<details>
<summary><strong>Full component list</strong></summary>

<br>

**Atoms**

`Avatar` · `Badge` · `Button` · `Checkbox` · `Code` · `Divider` · `Icon` · `Input` · `Island` · `Kbd` · `Link` · `Progress` · `Radio` · `Skeleton` · `Slider` · `Spinner` · `Switch` · `Text` · `Textarea`

**Layout**

`FlexContainer` · `ScrollArea`

**Molecules**

`Alert` · `Breadcrumbs` · `ButtonIsland` · `Card` · `CheckboxGroup` · `Field` · `Notification` · `RadioGroup` · `SearchField` · `Select` · `Tooltip` · `WindowControls`

**Organisms**

`Dialog` · `EmptyState` · `List` · `Menu` · `Popover` · **`SettingsMenu`** — data-driven settings UI: categories on the left, schema-driven fields on the right. Feed it a `SettingsSchema` and it doesn't care where the values come from. Ships with a pre-built Appearance category wired straight to `ThemeProvider`. · `WindowChrome`

**Providers**

`ThemeProvider` (theming), `OverlayProvider` (stacking + Escape scoping for `Dialog`/`Menu`/`Popover`), `NotificationProvider` (toasts)

For a hands-on guide to every one of these — what to import, what props to pass, working snippets — see **[WIKI.md](./WIKI.md)**.

</details>

```bash
pnpm add @stella-componente/terra@alpha
```

### `@stella-componente/vidrio`

The aesthetic expansion — frosted glass, dynamic lighting, textures, dynamic borders. A strict superset of Terra (Terra never depends on Vidrio; Vidrio depends on Terra), and never required to use Terra alone. Currently an empty scaffold — nothing has been built on top of Terra yet, so it stays unpublished rather than squatting the name.

### `@stella-componente/esterno` — **planned**

A set of **external** tools for interacting with Stella from outside the component tree — optional, and designed to be purely runtime-agnostic. What's planned so far:

- **Theme settings save/load**, via two functions rather than one: a TS-native function for a Stella app running as a plain web app, and an IPC-through-and-through function for Tauri/Electron, where persistence has to cross the runtime boundary.
- **A mechanism to swap the active CSS file** — hot-loading a different generated theme bundle at runtime.

### `@stella-componente/bellezza` — **planned**

An upgrade to the Appearance settings category, plus a set of ready-made custom CSS color schemes modeled on popular, well-loved themes — for people who want Stella to look like a specific palette without hand-authoring one.

## Writing your own components

Stella's component set won't cover everything — sooner or later you'll want something it doesn't ship. That's fine: everything is styled with CSS Modules, so plugging in is just a matter of following the same shape Stella's own components use — same file layout, the same `--stella-size-*` scale, the same grade-indirected tokens for elevation.

The full walkthrough, with code, lives in **[WIKI.md → Writing new components](./WIKI.md#writing-new-components)**.

## Getting started

```bash
pnpm install
pnpm typecheck
pnpm test                                              # Vitest — logic, ARIA, keyboard
pnpm --filter @stella-componente/terra test:ct         # Playwright — resolved CSS, geometry, axe
```

See **[WIKI.md](./WIKI.md)** for a practical, component-by-component usage guide, [CONTRIBUTING.md](./CONTRIBUTING.md) for the full dev, test, and PR workflow, and [CHANGELOG.md](./CHANGELOG.md) for what's shipped.

## License

MIT — see [LICENSE](./LICENSE).
