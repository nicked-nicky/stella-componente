# Verifying, building and publishing

The runbook for taking Stella-Componente from a working tree to a published
package, and for answering "is this actually green?" with something better than
a hunch. [CONTRIBUTING.md](./CONTRIBUTING.md) covers day-to-day contribution;
this covers verification and release.

## What the workspace actually contains

Three projects live under `packages/`, and they are not equal:

| Project                     | Published | In git | Notes                                                                                             |
| --------------------------- | --------- | ------ | ------------------------------------------------------------------------------------------------- |
| `@stella-componente/terra`  | yes       | yes    | The real package. Everything below is mostly about this.                                          |
| `@stella-componente/vidrio` | yes       | yes    | Currently a stub — `src/` is an `index.ts` and four `.gitkeep` files. Builds to an empty `dist/`. |
| `terra-test`                | no        | **no** | The live showcase. Its own repository, gitignored here.                                           |

That last row is the single most confusing thing about this workspace, and it is
worth internalising before you trust any command's exit code:

- **`packages/*` is the workspace glob**, so every `pnpm -r` script — `build`,
  `typecheck`, `test`, `clean` — runs in `terra-test` **on your machine**.
- **CI never sees it.** A fresh checkout has no `packages/terra-test`, so
  `pnpm build` on GitHub Actions builds two projects, not three.

So a red `pnpm build` locally and a green CI run are not a contradiction, and a
green CI run is not proof the showcase still compiles. Check both, knowing which
is which.

## The everyday loop

While writing a component, in rough order of how often you want them:

```bash
pnpm typecheck                                    # tsc across terra + vidrio
pnpm test                                         # Vitest (terra only; vidrio has no test script)
pnpm --filter @stella-componente/terra test:ct    # Playwright CT — needs a browser, see below
pnpm format                                       # Prettier, writes
```

Playwright needs its browser downloaded once per machine:

```bash
pnpm --filter @stella-componente/terra exec playwright install chromium
```

`pnpm --filter @stella-componente/terra test:watch` is the tight loop for unit
tests. There is no watch mode for the CT suite; it is slow enough that you run it
deliberately.

## Full verification — the CI-equivalent

This is the exact sequence `.github/workflows/ci.yml` runs, in order. Run it
before you push anything you care about:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm typecheck
pnpm test
pnpm --filter @stella-componente/terra test:ct
pnpm build
```

Two divergences from CI to keep in mind:

**`--frozen-lockfile` with a gitignored project.** `pnpm-lock.yaml` is committed
and contains an importer entry for `packages/terra-test`, which does not exist in
a fresh clone. If CI ever starts failing at the install step with
`ERR_PNPM_OUTDATED_LOCKFILE`, that is the cause. To reproduce what CI sees:

```bash
git clone . /tmp/stella-ci-check && cd /tmp/stella-ci-check
pnpm install --frozen-lockfile
```

**`pnpm build` builds the showcase too, locally.** To build only what ships:

```bash
pnpm --filter @stella-componente/terra --filter @stella-componente/vidrio build
```

`terra-test` is also, incidentally, the strictest typechecker pointed at Terra's
source. Its `tsconfig.app.json` sets `noUnusedLocals` and `noUnusedParameters`,
which Terra's own configs do not, and because the workspace dependency resolves
to `./src/index.ts` rather than `dist/`, it compiles Terra's real source. Dead
imports in Terra surface as `TS6133` in a `terra-test` build and nowhere else.
That is a feature — just remember the error is Terra's, not the showcase's.

## Clean before you pack

**`tsc` never prunes `dist/`.** Files whose sources were deleted, renamed, or
excluded from the build stay behind indefinitely, and `pnpm pack` will happily
ship them. This is not hypothetical: after the paused components were excluded
from `tsconfig.json`, their compiled output was still sitting in `dist/` from a
build two weeks earlier.

So a release build is always two commands:

```bash
pnpm --filter @stella-componente/terra clean
pnpm --filter @stella-componente/terra build
```

`prepublishOnly` does this for you (`clean && typecheck && test && build`), so
`pnpm publish` is safe. A manual `pnpm pack` is not — clean first, every time.

## Packing and inspecting the tarball

```bash
cd packages/terra
npm pack --dry-run            # lists what would ship, writes nothing
pnpm pack                     # writes the .tgz (gitignored via *.tgz)
tar -tzf stella-componente-terra-*.tgz | sort
```

What you are looking for:

- `package/dist/index.js`, `index.d.ts`, and a `.js` + `.d.ts` per component.
- `package/dist/styles/tokens.css` — the one entry consumers import by path.
  If this is missing, `copy-css.mjs` did not run or crashed.
- Every `.module.css` next to its component. `tsc` only emits `.ts`/`.tsx`;
  `scripts/copy-css.mjs` is what puts CSS in `dist/`, comments stripped.
- **No `src/`.** The `files` allowlist in `package.json` restricts the tarball to
  `dist/**`, and `publishConfig` swaps `main`/`types`/`exports` from `./src/` to
  `./dist/` at publish time. If you see `src/` in the tarball, one of those two
  mechanisms broke.
- **No paused components.** Nothing from a source directory carrying an
  `.on-pause` marker. If any appear, you packed without cleaning.
- **No test files.** No `*.test.js`, `*.ct.js`, or `*.story.js` — `tsconfig.json`
  excludes them from the build precisely so they do not reach a consumer's type
  resolution.

Two external checks worth running before a real release, neither of which needs
to be a dependency:

```bash
pnpm dlx publint                              # packaging correctness
pnpm dlx @arethetypeswrong/cli --pack .       # types resolve for every consumer style
```

Bundle weight has its own measurement:

```bash
node packages/terra/scripts/measure-treeshake.mjs
```

It reports per-scenario bundle sizes and names any component or icon that leaked
into a bundle that should not contain it. Run it whenever a change might move the
number, and quote before/after in the PR.

## Publishing

```bash
pnpm --filter @stella-componente/terra publish --access public
```

`prepublishOnly` runs `clean`, `typecheck`, `test` and `build` first. Note what it
does **not** run: the Playwright CT suite. Anything whose correctness is a
resolved CSS value — focus fills, state-layer escalation, `:has()` reactions — is
only covered there, so run `test:ct` by hand before publishing.

Tagged pushes (`v*`) trigger the same CI verify job; the tag is the record of what
was released, so tag the commit you actually published.

## Paused components

Some components are on pause and deliberately outside the repo, the build and the
package. Each is marked with an empty `.on-pause` file in its directory, and that
isolation is enforced in six places — `.gitignore`, `.prettierignore`, `packages/terra/.npmignore`, both
tsconfigs, and the test runners (`vitest.config.ts` `exclude`,
`playwright-ct.config.ts` `testIgnore`). `scripts/copy-css.mjs` is the one place
that reads the marker directly rather than hardcoding paths.

They are also absent from `src/index.ts`'s exports. Re-adding an export block is
the first step when one comes off pause.

Their directories exist only on disk now, not in git — **`git clean -fdx` will
delete them.**
