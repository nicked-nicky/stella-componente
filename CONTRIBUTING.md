# Contributing to Stella-Componente

Stella-Componente is a personal-identity project — the author uses it to build their own desktop apps and releases it open source. That shapes how contributions work: functional fixes, accessibility improvements, bug reports, and new components that fit the existing patterns are very welcome; visual-identity decisions (radius, spacing, motion, color, "does this look like libadwaita") are the maintainer's call, since the whole point of the kit is a specific, opinionated look. When in doubt, open an issue to discuss before writing code — see [Before you start](#before-you-start).

## Before you start

- **Bug fixes, a11y fixes, docs fixes:** just send a PR.
- **New component or prop:** open an issue first describing the use case. Saves you writing something that doesn't fit `Terra stays thin` or the atomic-design structure.
- **Visual changes:** open an issue first. "Does this match libadwaita" is a judgment call the maintainer needs to make directly.
- Check [WIKI.md](./WIKI.md) before writing a new component — [Writing new components](./WIKI.md#writing-new-components) covers file layout, sizing, and the grade convention every component follows, and the rest of the doc shows how the existing components are actually used.

## Design Language — the non-negotiables

See the [README's Design Language section](./README.md#design-language) for the full explanation; the rules below are the ones a PR gets bounced for violating:

- **No bare buttons.** Every `Button` renders inside a `ButtonIsland`, no exceptions. If your component needs an interactive row that isn't shaped like `ButtonIsland`'s segmented-group convention (a raw icon-only action, say), that's a sign it should compose `ButtonIsland` rather than reach around it — not a reason to render a `<button>` directly.
- **Grade, not a hardcoded surface.** A new surface-bearing component reads its colors through the grade-indirected tokens (`--stella-g-surface-*` / `--stella-g-border-*`) via a `data-stella-grade` attribute, and resolves that grade from its parent (`resolveGrade` / `resolveSurfaceGrade` in `internal/grade.ts`) rather than hardcoding `global`/`default`/`elevated` or reading the raw numbered `--stella-surface-N` scale directly.
- **Respect the three-grade ceiling.** `elevated` shouldn't contain another element with a surface of its own. If a design needs a fourth level of nesting, that's a sign the layout needs another `Island` boundary, not a fourth grade.

## Development setup

```bash
pnpm install
pnpm typecheck
pnpm test                                              # Vitest
pnpm --filter @stella-componente/terra test:ct         # Playwright (needs `playwright install chromium` once)
```

The live showcase (`packages/terra-test`) is a **separate repository** and is gitignored here, so `pnpm dev` won't have anything to run on a fresh clone — the test suites are your feedback loop instead.

## Code style

- Prettier is authoritative — run `pnpm format` before committing. `.tsx`/`.ts` files use spaces + single quotes (an override in `.prettierrc`); everything else uses tabs + double quotes. `pnpm format:check` runs in CI-equivalent mode if you want to check without writing.
- TypeScript strict mode is on (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Don't relax these for a single file — fix the type instead.
- No new dependency in `@stella-componente/terra` without a strong reason — the default answer to "should we add this" is no. If your change genuinely needs one, say why in the PR description (bundle size cost, what it replaces, why a small hand-rolled version isn't enough) and expect it to be a bigger discussion than the rest of the change. Terra's bundle weight is actively measured (`packages/terra/scripts/measure-treeshake.mjs`); if a change might move it, run it and report the before/after in the PR.
- CSS Modules only. No inline styles for anything that should vary by theme — that's what the design tokens in `styles/tokens.css` are for. Cross-file CSS sharing uses `composes:` against the shared modules in `styles/shared/`, not copy-paste — check there first before writing a new hover/focus/dismiss-button treatment from scratch.
- Elevation is expressed with a component's `grade` prop (`global` / `default` / `elevated`), resolved via `internal/grade.ts`'s helpers — not a hardcoded surface tone. A nested surface (a `Card` in a `Card`, a `Popover` off an `Island`) should escalate its own grade from its parent rather than the caller picking a tone by hand.

## Accessibility

Not optional, not an opt-in prop. If you're adding an interactive component:

- Use the native HTML element if one exists (`<input>`, `<button>`, `<textarea>`) before reaching for a custom `role`.
- Keyboard navigation has to work — Tab, and whatever the native/ARIA pattern for that role expects (arrow keys for a roving-tabindex list, Space/Enter for a button-like control).
- `:focus-visible` is a contrast fill, never an outline. A button-shaped control composes `focusFill` from `styles/shared/` and inverts wholesale; a control made of parts recolours those parts; a text field shifts its border so the value stays readable. If a persistent selected state can also apply, that state has to yield with `:not(:focus-visible)` — otherwise it wins on source order and the focus indicator disappears exactly where it matters most.
- CI runs an axe-core scan (`@axe-core/playwright`, via `checkA11y()` in `playwright/a11y.ts`) over every Playwright component test. A new `.ct.tsx` should call it.

## Tests

Two layers, deliberately not one — jsdom never resolves a real CSS cascade (no `:has()`, no `light-dark()`, no computed-style resolution), so a class of real bug (two state-layer tokens resolving to the same value, so hover stops being visible) is invisible to a jsdom test no matter how thorough:

- **Vitest + Testing Library** (`*.test.tsx`, colocated) — logic, ARIA, keyboard, controlled/uncontrolled state. If the behavior lives in JS/TSX (state, event handlers, ARIA attributes), it's here.
- **Playwright CT** (`*.ct.tsx`, colocated) — anything whose correctness is a resolved CSS value (a color that should change on hover/press, a `:has()` reaction). A unit test asserting a CSS rule _exists_ doesn't prove it _works_ — only a real browser can answer that.
- `utils/positioning.ts` and `theme/ThemeManager.ts` get direct unit tests, since both are pure and shared by many consumers — a failure there should name the broken unit, not surface as several unrelated component-test failures.

New components/props should come with at least one test of whichever kind is relevant. Bug fixes for a real regression should come with a test that would have caught it — see `ButtonIsland.ct.tsx` for the pattern.

## Commits & PRs

- Commit messages: short imperative summary line (`Fix Button focus fill`, not `Fixed` or `Fixing`), body if the _why_ isn't obvious from the diff.
- One logical change per PR. A component fix and an unrelated README tweak are two PRs.
- Update `CHANGELOG.md` under `[Unreleased]` for anything user-facing (new component, prop, bug fix, breaking change) — see existing entries for the level of detail expected: what changed and _why_, not just what.

## Reporting issues

Include: what you expected, what happened, a minimal reproduction (a snippet is usually enough — this isn't a large app, most bugs reproduce in a few lines). For visual bugs, a screenshot; for keyboard/a11y bugs, which keys you pressed and what should have happened.

## License

By contributing, you agree your contribution is licensed under the project's [MIT license](./LICENSE).
