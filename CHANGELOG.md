# Changelog

All notable changes to Stella-Componente are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). `@stella-componente/terra` follows [Semantic Versioning](https://semver.org/) from its first published release; pre-1.0, a minor bump may still carry breaking changes (the standard semver-0.x reading). `@stella-componente/vidrio` remains unpublished and workspace-only.

## [0.1.0-alpha.2] — 2026-09-09

### Added

- **17 new components**, taking the kit from 23 to 40 (plus the three providers): atoms `Code`, `Kbd`, `Link`, `Progress`, `Skeleton`, `Textarea`; layout `ScrollArea`; molecules `Alert`, `Breadcrumbs`, `Card`, `CheckboxGroup`, `Field`, `RadioGroup`, `SearchField`, `Select`; organisms `EmptyState`, `List`.
- **Grade-based elevation system** (`internal/grade.ts`: `resolveGrade`, `resolveSurfaceGrade`, `nextGrade`) — surfaces now carry a `grade` (`'global' | 'default' | 'elevated'`) instead of a fixed tone, and nested surfaces (`Card` inside `Card`, an overlay off an `Island`) escalate their own grade from their parent by default rather than the caller hand-picking a tone at every level.
- **`internal/` layer** — a new non-exported top-level source category for shared primitives that aren't public API: `grade.ts` (above) and `useModalSurface.ts`, which `Dialog` builds its portal/focus-trap/Escape/backdrop machinery on.
- **`packages/terra/scripts/measure-treeshake.mjs`** — bundles synthetic single-component consumer entrypoints with Vite in lib mode and reports JS/CSS weight (raw and gzipped), so a per-component or whole-kit payload claim in the docs is a number that was actually measured, not estimated.
- Shared style modules for cross-cutting CSS that used to be copy-pasted per component: `styles/shared/controlGroup.module.css`, `dismissButton.module.css`, `field.module.css`, `focusFill.module.css`, `iconSize.module.css`.
- `utils/cx.ts` — a small dependency-free `classnames`-style joiner, and `utils/flattenFragments.ts` — flattens `<>...</>` fragments out of a compound component's `children` so consumers can wrap children in a fragment without breaking `Children.forEach`-based logic.
- **Test coverage for the components that carry real behaviour**: `RadioGroup`, `CheckboxGroup`, `Field`, `SearchField`, `List`, `Slider`, `Tooltip`, `Popover`, `ThemeProvider` and `EmptyState` each gained a colocated Vitest suite, and `Switch`/`Radio` gained Playwright CT suites for the parts whose correctness is a resolved CSS value.

### Changed

- **Every design token was renamed.** The semantic names (`--stella-surface-card`, `--stella-text-primary`, `--stella-state-hover`, `--stella-border-default`, and the rest) are replaced by numbered scales — `--stella-surface-0…9`, `--stella-text-0…3`, `--stella-border-0…9` — plus a grade-indirected ladder (`--stella-g-surface-*`, `--stella-g-border-*`) that resolves against the nearest `data-stella-grade` ancestor. A fixed tone could only ever be right at one nesting depth; a numbered scale read through a grade is right at every depth. **Breaking** for any consumer referencing a Terra token in their own CSS.
- **`Island`'s `tone` prop is gone**, replaced by `grade` (see Added, above). **Breaking** for any code passing `tone` directly.
- **`:focus-visible` is now a contrast fill, never an outline.** Interactive components recolour their own parts on keyboard focus instead of drawing a ring around them: button-shaped controls invert wholesale (`--stella-focus` background, `--stella-g-surface-0` text) via the new shared `focusFill` module, controls with distinct parts recolour those parts (the `Switch`'s track and thumb, the `Checkbox`'s box and tick, the `Radio`'s dot and mark, the `Slider`'s thumb), and text fields — where the value has to stay readable while typing — shift their border to the focus colour instead of inverting. **Breaking** for anyone who styled around the old rings.
- **Explanatory comments are gone from `src/`.** The build already stripped them from `dist/`; they are now absent at the source too.
- Published tarball now actually includes `dist/**/*.map` in `package.json`'s `files` array — the alpha.1 changelog described debugging via inline source maps, but the maps themselves weren't listed and so were never published; fixed here.
- Components whose development is on hold now carry an `.on-pause` marker file in their directory, and that marker is honoured by `.gitignore`, `.prettierignore`, `.npmignore`, both `tsconfig`s, and both test runners. `scripts/copy-css.mjs` reads the marker directly, which is what stops a paused component's stylesheet reaching `dist/` even when nothing of it is compiled.

### Fixed

- **A selected `Button` swallowed its own focus indicator.** `.button.active` and `.focusFill:focus-visible` share a specificity, and the selected rule came later — so the current row of a `SettingsMenu` nav, or an active `Menu.Item`, could be keyboard-focused with no visible change at all. Selected states now yield to `:focus-visible` explicitly. `Menu.Item`'s destructive colour had the same problem, leaving red text on the dark focus fill.
- **`SearchField`'s clear button left the typed text in the field.** In its uncontrolled branch the underlying `Input` receives `defaultValue`, so resetting component state hid the clear button while the DOM node kept its value. It now clears the node too.
- **A title bar with no tabs could not be dragged.** Every child of `WindowChrome` opted out of the drag region — including the brand pill at the leading edge and the tabs region, which grows to fill whatever space is left even when it is empty — leaving no draggable pixel and no working double-click-to-maximize. `noDrag` is now applied only to genuinely interactive clusters.

### Removed

- **Commit-pulse feedback system** (`utils/usePulse.ts`, `styles/shared/pulseRing.module.css`, the `--stella-pulse-ring-animation`/`--stella-pulse-ring` tokens) — removed entirely, including from `Checkbox`, `Radio`, `Switch` and `Slider`. `Skeleton`'s shimmer animation is unrelated and unaffected.

### Docs

- **`WIKI.md`** — a new practical, code-first guide: `ButtonIsland`/`Button` structure and props, building a dismissable `SettingsMenu` with a real schema, a short usage snippet for every other shipped component, a full "writing your own components" walkthrough, and how the overlay/notification hooks (`useOverlayLayer`, `useDismissableOverlay`, `useNotifications`) actually work. Linked from `README.md` and `CONTRIBUTING.md`.
- **`RELEASING.md`** — the verification runbook: what the workspace actually contains, the CI-equivalent command sequence, why `dist/` has to be cleaned before packing, and a checklist for what should and should not be inside the tarball.
- **README overhaul.** Documents the Design Language for the first time — islands as the unit of separation, the three-grade nesting ceiling (`global` / `default` / `elevated`), and the "no bare buttons outside `ButtonIsland`" rule — and records two newly planned packages, `@stella-componente/esterno` (external theme-settings/CSS-swap tooling) and `@stella-componente/bellezza` (Appearance-menu upgrade + built-in color schemes). `CONTRIBUTING.md` gained a Design Language section codifying the same rules as review-blocking requirements; `packages/terra/README.md` gained a roadmap note and calls out the `ButtonIsland` requirement explicitly.
- `docs/` (the two audit documents added and removed within this same unreleased window) is gone — the maintainer didn't need it going forward.

## [0.1.0-alpha.1] — 2026-08-21

### Added

- **Slider atom** (`atoms/Slider`) — native `<input type="range">` with a decorative ghost thumb overlay so the thumb position is animatable. Live vs. committed value split (live updates every tick, `onValueChange` fires once per gesture), editable numeric readout, `showValue` prop, and the shared commit-pulse on settle.
- **Commit-pulse feedback** — a brief expanding, fading ring played when a value actually commits. Shared `utils/usePulse.ts` hook and `styles/shared/pulseRing.module.css` base, `tokens.css` `--stella-pulse-ring-animation`/`stella-pulse-ring` keyframes. Integrated in `Checkbox`, `Radio`, `Switch`, and `Slider`; JS-gated (onChange/onClick) so pre-checked/pre-set values never pulse on mount.
- **Motion theme axis** — `MotionStyle` (`'system'` | `'reduced'` | `'off'`) mirroring `ColorScheme`'s system-deference shape. `ThemeManager.setMotion()` / `ThemeProvider.setMotion()` write `data-stella-motion`; `tokens.css` collapses durations for `reduced` and kills `animation`/`transition` for `off`. `Spinner` is explicitly exempt at both tiers so loading never looks hung.
- **Pre-built Appearance settings category** — `organisms/SettingsMenu/appearanceCategory.tsx` (`appearanceSettingsCategory`, `getAppearanceValues()`, `applyAppearanceChange()`, `AppearanceThemeControls`, `AppearanceSettingsValues`). Bridges `ThemeManager`/`useTheme()` to a ready-made `SettingsCategory` covering colorScheme/radius/density/borderWidth/motion; fully optional/composable.
- **Theme icons** — `PaletteIcon`, `SunIcon`, `MoonIcon`, `MonitorIcon` in `utils/icons.tsx` for the appearance category (and any consumer use).

### Changed

- **Hover/press micro-interactions** on form controls — `Checkbox` box, `Radio` dot, `Switch` thumb, and `Slider` ghost thumb use a single-scale CSS variable per control (e.g. `--checkbox-box-scale`, `--switch-thumb-scale`, `--slider-thumb-scale`) for a subtle grow on hover (1.03–1.06×) and shrink on press (0.92–0.94×). `Switch` thumb translation is now via `--switch-thumb-x` rather than a direct `transform`.
- `Input` hover/press now uses a `::before` overlay animating `opacity` instead of a swapped `background-image` gradient (gradients are not reliably interpolable — the overlay gives a smooth tween).
- `Spinner` retains its spin at `prefers-reduced-motion` and at explicit `data-stella-motion="reduced"`/`"off"` (with `!important` for the `off` kill-switch).
- **Build output is `dist/` only** — `package.json` `files` is now `dist/**/*.js` + `dist/**/*.d.ts` + `dist/**/*.css` + `LICENSE` + `README.md` (was `dist` + `src` with negations). Published tarball no longer ships `src/`; debugging still works byte-for-byte via `tsconfig.json` `inlineSources: true` (sources embedded in each `.js.map`) and `.js` comments are stripped (`removeComments: true`, declaration emit untouched so JSDoc stays in `.d.ts`). `scripts/copy-css.mjs` now strips `/* … */` CSS comments on copy to `dist/` (tokens.css alone is ~59% comments).
- **CI** — workflow now also triggers on `tags: ['v*']` for releases (comment-only cleanup).

### Removed

- `lucide-react` peer and dev dependency — `@stella-componente/terra` now has zero runtime dependencies by default (peers are `react`/`react-dom` only). The optional `peerDependenciesMeta` entry is gone; internal chrome icons live in `utils/icons.tsx`.

## [0.1.0-alpha.0] — 2026-08-21

First published release of `@stella-componente/terra`, on the `alpha` dist-tag so it
does not become `latest`. `@stella-componente/vidrio` stays unpublished — it is still
an empty scaffold, and shipping a package with no components would only
squat the name.

### Added

- **Test suite across every component directory**, split along the two-layer boundary the WIKI describes. Vitest covers logic, ARIA and keyboard behaviour (`OverlayProvider`'s Escape scoping, `Dialog`'s focus trap and focus restore, `Menu`'s full WAI-ARIA keyboard contract, `NotificationProvider`'s timer/queue behaviour, controlled-vs-uncontrolled for `Input`/`Radio`, plus thin smoke tests for the presentational atoms). Playwright CT covers anything whose correctness lives in resolved CSS (`Button`'s state-layer ladder and focus ring, `SettingsMenu`'s selected-vs-hovered nav row, `WindowChrome`'s transparent strip and drag regions).
- `utils/positioning.ts` and `theme/ThemeManager.ts` get direct unit tests — both are pure, and every anchored component and every theme axis routes through them, so a failure names the broken unit instead of surfacing as four failing component tests.
- **axe-core accessibility scanning** in the Playwright layer, via a shared `checkA11y()` helper (`playwright/a11y.ts`). devDependency only — no effect on Terra's shipped bundle.
- **CI workflow** (`.github/workflows/ci.yml`) running format check, typecheck, Vitest, Playwright CT and build on push and PR. Everything was manual before this.
- `tsconfig.typecheck.json` — a noEmit config covering the test files, `playwright/`, and the config files, which the build config deliberately excludes.
- Initial atomic component set for `@stella-componente/terra`: 13 atoms (Avatar, Badge, Button, Checkbox, Divider, Icon, Input, Island, Radio, Separator, Spinner, Switch, Text), the `FlexContainer` layout primitive, `ButtonIsland` and `Notification` molecules, and `Dialog` and `SettingsMenu` organisms.
- Theme engine (`ThemeManager` / `ThemeProvider` / `useTheme`) with four independently configurable axes, each backed by CSS custom properties: color scheme (`light`/`dark`/`system`), corner radius (`sharp`/`default`/`round`), spacing density (`compact`/`default`/`comfortable`), and border width (`none`/`thin`/`default`/`thick`) — `none` is a genuine borderless mode, every hairline in Terra reads the same token.
- `OverlayProvider` — shared portal, DOM-order stacking, and Escape-key scoping (only the topmost layer responds) for `Dialog` and future overlay-type components.
- `NotificationProvider` / `useNotifications` — toast queueing, pause-on-hover auto-dismiss, `aria-live` announcement.
- Automatic hairline separators between adjacent buttons inside a `ButtonIsland` (GTK/libadwaita's "linked" button-group convention) — no manual separator needed for the common case. `ButtonIsland.Separator` (the standalone `Separator` atom) remains for an explicit sub-cluster break.
- Fade-out exit animations for `Dialog` (backdrop + panel) and `Notification` toasts before unmount, respecting `prefers-reduced-motion`.
- `@stella-componente/vidrio` package scaffold — depends on `@stella-componente/terra` via `workspace:*`; no components built on top yet.

- State-layer tokens (`--stella-state-hover` / `-active` / `-selected`) — translucent overlays of the foreground color rather than opaque surface tones, so one definition composites correctly over any surface (libadwaita's model). Replaces `--stella-surface-hover`.
- `--stella-rim` — libadwaita's hairline top highlight, composed alongside the drop shadow on floating surfaces (`Island tone="overlay"`, `Dialog`, `Notification`).
- `--stella-easing-in` — the accelerate curve, for exit animations.
- Letter-spacing tokens for every type-scale entry (`--stella-text-*-ls`), plus `text-wrap: balance` on the two largest sizes and `font-variant-numeric: tabular-nums` on `mono`.
- `sidebar` tone on `Island`, giving the existing `--stella-surface-sidebar` token a reachable component API.
- `.prettierrc` and `format` / `format:check` scripts.
- `WIKI.md` (orientation, development workflow, component conventions, architecture reference, browser support, testing, known gaps) and `CONTRIBUTING.md`.

### Changed

- **Toolchain updated to current stable**: Vite 5 → 8, Vitest 2 → 4, jsdom 25 → 30, `@vitejs/plugin-react` 4 → 6, Testing Library React 16.3, Playwright 1.62, typedoc 0.26 → 0.28, pnpm 9 → 11, CI on Node 22. Terra now develops against React 19 while keeping its `react >=18` peer range, so both majors stay supported. TypeScript deliberately stays on 5.9 rather than 7.0 — the type-tooling ecosystem hasn't caught up to the native compiler yet, and Terra's build is only `tsc`.
- `@testing-library/jest-dom` pinned to `~6.9.1`: 6.10.0 is published but deprecated, and a `^` range would resolve straight to it.
- **`WindowChrome` lost its bottom seam** — a transparent strip now, matching Ray's `.menu` and color-cart's `<header>`, with the app canvas showing through between the four floating regions. `ButtonIsland` and `Menu` keep their automatic per-pair hairline (`button + button` / `.item + .item`); `ButtonIsland.Separator` and `Menu.Separator` remain for genuine cluster breaks. `SettingsMenu`'s between-row rules dropped to `--stella-border-subtle`, matching color-cart's `divide-border/60`.
- **`ButtonIsland` children now fill the island's interior height** — Ray's `.menu-button { height: 100% }`. `Button`'s `--stella-size-*` became a `min-height`, the inner row defaults to `align="stretch"`, and the `Island` gets `alignItems: stretch`. Fixes title-bar clusters of different `size` rendering at different heights: a `size="sm"` `WindowControls` and a `size="md"` `systemTools` group sitting side by side in `WindowChrome` now line up instead of one floating centred with dead space above and below it.
- **Surfaces are a real elevation ladder** rather than one tone reused. `--stella-surface-header` (toolbars, `ButtonIsland`, title-bar pills, `Input`) now sits a step _proud_ of `--stella-surface-card` in dark, following Ray's `body → container → group` layering — previously the two were identical, which made a `ButtonIsland` invisible on a card. `--stella-surface-muted` became a recessed well at canvas level, and the light canvas darkened to `#f0f0f0` so white panels read as raised (color-cart's model).
- **`Button` carries no surface of its own.** It is transparent and borrows the wrapping `ButtonIsland`'s tone, exactly as Ray's `.menu-button` borrows `.menu-button-group`. Interaction is now purely the state-layer ladder, and the label starts at `--stella-text-secondary` and brightens to full strength on hover — color-cart's quiet-until-touched treatment.
- **`Button`'s `variant` prop is gone**, along with the `ButtonVariant` type. It had exactly one possible value (`'filled'`) and therefore could not vary — dead configuration. Mark the current pick with `active` as before.
- `Button`'s `active` state and `Menu.Item`'s `[data-active]` now both use `--stella-state-selected` instead of a `--stella-border-default` fill, so a selected button, a selected menu item and a current `SettingsMenu` row are all literally the same token. State-layer alphas were re-tuned into a clearly stepped hover → press → selected ladder, mirroring Ray's `#414151 → #4c4c5c → #575767`.
- `Input` reads `--stella-surface-header` instead of raw palette steps, so a standalone field and a button group beside it are the same class of object.
- **`WindowChrome` is a transparent strip** at the new `--stella-bar-height` token, with no background and no bottom seam — the app canvas shows through between the four floating regions, matching Ray's `.menu` and color-cart's `<header>`.
- `ApplicationExample` restructured to Ray's root layout: the app is inset from the window edge, and the sidebar and viewport are independent bordered `Island`s separated by a gap rather than one container split by an internal border.
- **Light/dark now resolves through CSS `light-dark()` driven by `color-scheme`**, replacing the duplicated `@media (prefers-color-scheme: light) { :root:not([data-theme]) }` + `:root[data-theme='light']` block pair. Every theme-dependent alias is declared once; the per-component light-override blocks in `Button`, `Input`, and `Badge` are gone entirely. Sets a Baseline 2024 browser floor (Chrome 123+, Safari 17.5+, Firefox 120+, WebKitGTK 2.44+).
- `Avatar` sizes now read the shared `--stella-size-*` control scale instead of five bespoke pixel values, so an Avatar lines up with a Button or Input of the same size token. Initials scale from the same token by ratio rather than five hardcoded font sizes.
- Fixed-size controls (`Checkbox`, `Radio`, `Switch`, `Icon`, `Spinner`, `Avatar`) now document _why_ they don't scale with density — they're pointer targets and pixel-grid artwork, so `density` tightens the space between them, not the controls themselves.
- `SettingsMenu`'s active nav row uses `--stella-state-selected` (the quiet "current row" signal) rather than the same token as hover.

- `Notification` toast redesigned as a compact pill — status carried by icon color rather than a colored left border — and repositioned from top-right to bottom-center.
- `Button`'s `active` state background now reuses `--stella-border-default` (the same token the surrounding `Island`'s border is drawn in) instead of a fixed neutral tone, so it tracks light/dark theme correctly and reads as "picked" by matching the group's own chrome.
- `Dialog.Header` padding reduced for a visually thinner header.

### Fixed

- **The ButtonIsland separator dissolved into a hovered button.** `--stella-state-hover` is both the fill a Button takes on hover and the exact value of `--stella-border-default`, which the separator rests at — so escalating the hairline to it painted the line the same colour as the button now sitting against it, while also "changing" it to the colour it already was. Both the separator's and the Island's border escalation now read a dedicated hairline ladder (`--stella-border-hover` / `--stella-border-active`), written as the fill ladder shifted one rung so the relationship stays visible in the source.
- **A lone `Button` would not fill a widened `ButtonIsland`.** Horizontal growth runs through three boxes and the middle one opted out: the inner button row is a `FlexContainer` with no flex declaration, so it defaulted to `flex-grow: 0` and sat at content width, leaving nothing inside it for the single child's `flex: 1` to claim. The row now grows. `shape="pill"` stays content-sized, so an Island nobody has widened still hugs its button.
- **`SettingsMenu` resized itself when switching category**, taking the window and the nav column's scroll position with it. It now holds a fixed height (`--stella-settings-height`, default `80vh`) with both columns scrolling independently.
- **`@stella-componente/terra` could not be resolved by workspace consumers.** Its `exports` pointed only at `./dist`, which is gitignored and never built during development, so `pnpm dev` failed on a clean checkout with _"Failed to resolve entry for package @stella-componente/terra"_ — despite the WIKI documenting that `terra-test` consumes `src/` directly. `exports` now point at `./src/index.ts`, with `publishConfig` overriding them to `./dist` at publish time (pnpm swaps them automatically; nothing needs hand-editing at release).
- **`pnpm build` would have emitted test files into `dist/`.** The build `tsconfig` compiled everything under `src/`, so `*.test.tsx`/`*.ct.tsx` would ship alongside the components and drag Vitest/Playwright types into consumers' type resolution — and `tsc` would fail outright on `playwright/` sitting outside `rootDir`. Build and typecheck configs are now separate.
- **`Button` had no visible focus ring.** It set `outline: 0` on `:focus-visible`, making it the only interactive component in the kit with no keyboard focus indicator — a direct contradiction of both its own docblock and the project's accessibility principle. Now draws an inset ring (`outline-offset: -2px`), matching `Menu.Item`, so it stays visible inside a clipping `Island`.
- **`--stella-easing-out` was an accelerating curve** (`cubic-bezier(0.4, 0, 1, 1)` — Material's _accelerate_) despite its name, so nearly every transition in the kit sped up as it finished. Corrected to `cubic-bezier(0, 0, 0.2, 1)`; the old value now lives on as `--stella-easing-in` and is applied to exit animations.
- **`Input`'s error state set `outline-color` with no `outline-style`**, so the declaration painted nothing. `Input` now has a real 2px focus ring like every other control instead of signalling focus by border color alone.
- **`--stella-surface-hover` and `--stella-surface-muted` resolved to the same value in both themes**, so hovering anything on a muted surface produced no visible change. Fixed structurally by the state-layer tokens.
- **Shadows were ~10% black in both themes**, effectively invisible against dark surfaces — every overlay, popover, menu and dialog was floating with no perceptible elevation in the default theme. Shadow _color_ is now theme-aware (`--stella-shadow-color`) while geometry stays fixed.
- **No `color-scheme` declaration**, so native scrollbars, text selection, and form-control chrome stayed light in dark mode.
- `Switch`'s checked-hover state used a magic `filter: brightness(1.1)`; now a state layer, which also collapsed two rules into one.
- Formatting drift across stylesheets (9 files tab-indented, 14 space-indented, mixed quote styles).

### Removed

- Runtime accent-color switching (`ThemeManager.setAccent`, `--stella-accent-*` tokens, `AccentColor`). Terra uses a single neutral color scheme; color is reserved for exactly five status meanings (success / info / warning / error / debug), defined as alias token triplets and consumed by `Badge` and `Notification`.
- `Button`'s status-colored variants (`success` / `info` / `warning` / `destructive` / `debug`) — `filled` is the only variant now.
- Unused duplicate token source (`design-tokens.ts`) — `styles/tokens.css` is the single source of truth for design tokens.
