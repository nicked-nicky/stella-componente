#!/usr/bin/env node
/**
 * Tree-shaking / payload measurement for Terra.
 *
 * Answers the one question that reorders every other optimisation
 * decision: when a consumer imports a single component, what do they
 * actually pay? Everything else we might do (shared grade ladder,
 * token renaming, package splits) is worth single-digit kilobytes.
 * If importing `<Button>` drags in all 18 icons, SettingsMenu and the
 * theme engine, that dwarfs the lot — and it's fixable.
 *
 * Bundles a series of synthetic consumer entrypoints with Vite in lib
 * mode (Vite is already a devDependency here, so this adds nothing to
 * the dependency tree), minifies, and reports JS + CSS weight raw and
 * gzipped. Then it greps each bundle for `displayName` string literals
 * — which survive minification intact — to name what leaked in.
 *
 * Usage, from packages/terra:
 *   node scripts/measure-treeshake.mjs                 # measures src/
 *   pnpm run build && node scripts/measure-treeshake.mjs --dist
 *   node scripts/measure-treeshake.mjs --both
 *
 * Writes treeshake-report.md next to package.json and prints a summary.
 */

import { mkdtemp, writeFile, readFile, rm, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pkgDir = join(scriptDir, '..');

// ---------------------------------------------------------------------------
// Scenarios — each is one synthetic consumer. The point of the ladder is
// to see where the cost actually lands: if "Button" and "everything" are
// close, tree-shaking is not working.
// ---------------------------------------------------------------------------
const SCENARIOS = [
  { name: 'Button only', exports: ['Button'] },
  { name: 'Button + Island', exports: ['Button', 'Island'] },
  { name: 'Text only (no CSS-heavy deps)', exports: ['Text'] },
  { name: 'Input + Field', exports: ['Input', 'Field'] },
  { name: 'Typical small app', exports: ['Button', 'ButtonIsland', 'Input', 'Card', 'Text'] },
  { name: 'Overlay stack', exports: ['Dialog', 'OverlayProvider'] },
  { name: 'ThemeProvider only', exports: ['ThemeProvider'] },
  { name: 'EVERYTHING (import * )', exports: null },
];

// Components whose presence in a bundle is worth naming. These are matched
// against `displayName = '...'` assignments, which minifiers keep verbatim.
const LEAK_MARKERS = [
  'SettingsMenu', 'WindowChrome', 'WindowControls', 'Table', 'Accordion',
  'Drawer', 'Dialog', 'Menu', 'Popover', 'Tooltip', 'Select', 'Slider',
  'Switch', 'Checkbox', 'Radio', 'Avatar', 'Skeleton', 'Progress',
  'Breadcrumbs', 'Tabs', 'Alert', 'Notification', 'CodeBlock', 'SearchField',
];

// Per-icon path data from utils/icons.tsx, which minifiers keep verbatim.
// Probing one icon was useless: Dialog legitimately imports CloseIcon, so a
// hit told us nothing about whether the other 17 came along for the ride.
// The question is only ever "did icons this bundle has no use for ship
// anyway", so every icon gets its own marker and the report names them.
const ICON_MARKERS = {
  CloseIcon: 'M4 4l8 8M12 4l-8 8',
  RestoreIcon: 'M5.5 5.5V3.5H12.5V10.5H10.5',
  PaletteIcon: 'M8 2a6 6 0 1 0 0 12c.73 0',
  SunIcon: 'M8 1.5v1.3M8 13.2v1.3',
  MoonIcon: 'M13.5 9.75A5.5 5.5 0 1 1 6.25 2.5a4.5',
  MonitorIcon: 'M5.5 14h5M8 11.5V14',
  CopyIcon: 'M3.5 10V3.8A1.3 1.3 0 0 1 4.8 2.5H11',
  CheckIcon: 'M3.5 8.5L6.5 11.5L12.5 4.5',
  InfoIcon: 'M8 7.25v3.5',
  SuccessIcon: 'M5.25 8.25L7.1 10.1l3.65-4.2',
  WarningIcon: 'M7.13 2.6 1.7 12.05a1 1 0 0 0 .87 1.5h10.86a',
  ErrorIcon: 'M5.9 5.9l4.2 4.2M10.1 5.9l-4.2 4.2',
  DebugIcon: 'M6.1 4.1 5.1 3.1M9.9 4.1l1-1M4.75 8.25h-2.5M',
  SearchIcon: 'M10.6 10.6l2.65 2.65',
  ChevronRightIcon: 'M6 4l4 4-4 4',
  ChevronDownIcon: 'M4 6l4 4 4-4',
};

const fmt = (n) => n.toLocaleString('en-US');
const kb = (n) => (n / 1024).toFixed(1) + ' kB';

// Vite 8 runs on rolldown, where the minifier is oxc and `minify: 'esbuild'`
// requires esbuild as a separate install. Older Vite wants 'esbuild'. Rather
// than pin either, negotiate once at startup and reuse whatever works.
// `false` is the last resort: raw sizes are then inflated, but the *ratios*
// between scenarios — which is the actual question — stay valid.
const MINIFIERS = ['oxc', true, 'esbuild', 'terser', false];
let MINIFIER = null;

async function dirSize(dir) {
  let js = 0, css = 0, jsBuf = [], cssBuf = [];
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) { await walk(p); continue; }
      const buf = await readFile(p);
      if (e.name.endsWith('.js') || e.name.endsWith('.mjs')) { js += buf.length; jsBuf.push(buf); }
      else if (e.name.endsWith('.css')) { css += buf.length; cssBuf.push(buf); }
    }
  };
  await walk(dir);
  const jsAll = Buffer.concat(jsBuf);
  const cssAll = Buffer.concat(cssBuf);
  return {
    js, css,
    jsGz: js ? gzipSync(jsAll, { level: 9 }).length : 0,
    cssGz: css ? gzipSync(cssAll, { level: 9 }).length : 0,
    text: jsAll.toString('utf8'),
  };
}

async function measure(build, entryTarget, scenario, tmpRoot, i) {
  const workDir = join(tmpRoot, `s${i}`);
  await mkdir(workDir, { recursive: true });
  const entry = join(workDir, 'entry.js');

  const src = scenario.exports === null
    ? `import * as Terra from ${JSON.stringify(entryTarget)};\nglobalThis.__t = Terra;\n`
    : `import { ${scenario.exports.join(', ')} } from ${JSON.stringify(entryTarget)};\n` +
      `globalThis.__t = [${scenario.exports.join(', ')}];\n`;
  await writeFile(entry, src);

  const outDir = join(workDir, 'out');
  const cfg = (minify) => ({
    root: workDir,
    logLevel: 'silent',
    configFile: false,
    define: { 'process.env.NODE_ENV': '"production"' },
    build: {
      outDir,
      emptyOutDir: true,
      minify,
      cssCodeSplit: false,
      reportCompressedSize: false,
      lib: { entry, formats: ['es'], fileName: 'bundle' },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
      },
    },
  });

  if (MINIFIER === null) {
    let lastErr;
    for (const m of MINIFIERS) {
      try {
        await build(cfg(m));
        MINIFIER = m;
        break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (MINIFIER === null) throw lastErr;
  } else {
    await build(cfg(MINIFIER));
  }

  const m = await dirSize(outDir);
  // A component that was never imported but whose displayName literal is
  // in the bundle did not get shaken out.
  const asked = new Set(scenario.exports ?? LEAK_MARKERS);
  const leaked =
    scenario.exports === null
      ? []
      : LEAK_MARKERS.filter((n) => !asked.has(n) && m.text.includes(`"${n}"`));
  const icons = Object.entries(ICON_MARKERS)
    .filter(([, marker]) => m.text.includes(marker))
    .map(([name]) => name);
  return { ...m, leaked, icons };
}

async function run(label, entryTarget, build, lines) {
  lines.push(`\n## ${label}\n`);
  lines.push('| scenario | JS | JS gzip | CSS | CSS gzip |');
  lines.push('|---|---:|---:|---:|---:|');

  const results = [];
  let failure = null;
  const tmpRoot = await mkdtemp(join(tmpdir(), 'terra-shake-'));
  try {
    for (let i = 0; i < SCENARIOS.length; i++) {
      const s = SCENARIOS[i];
      process.stdout.write(`  ${label}: ${s.name} ... `);
      try {
        const r = await measure(build, entryTarget, s, tmpRoot, i);
        results.push({ s, r });
        lines.push(`| ${s.name} | ${kb(r.js)} | ${kb(r.jsGz)} | ${kb(r.css)} | ${kb(r.cssGz)} |`);
        console.log(`js ${kb(r.js)} (gz ${kb(r.jsGz)}), css ${kb(r.css)} (gz ${kb(r.cssGz)})`);
      } catch (err) {
        lines.push(`| ${s.name} | FAILED | | | |`);
        console.log('FAILED');
        // One copy of the error, not one per scenario — a build config
        // problem fails identically eight times and drowns the report.
        if (!failure) {
          failure = String(err && err.message ? err.message : err).slice(0, 1200);
        }
      }
    }
  } finally {
    await rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
  }

  if (failure) {
    lines.push(`\n<details><summary>First build error</summary>\n\n\`\`\`\n${failure}\n\`\`\`\n\n</details>\n`);
  }
  if (results.length) {
    lines.push(`\nMinifier used: \`${String(MINIFIER)}\`` +
      (MINIFIER === false
        ? ' — **unminified**, so absolute sizes are inflated; compare the ratios, not the kB.'
        : '') + '\n');
  }

  const first = results.find((x) => x.s.exports && x.s.exports.length === 1);
  const all = results.find((x) => x.s.exports === null);
  if (first && all) {
    const ratio = all.r.jsGz ? Math.round((first.r.jsGz / all.r.jsGz) * 100) : 0;
    const cssRatio = all.r.cssGz ? Math.round((first.r.cssGz / all.r.cssGz) * 100) : 0;
    lines.push(
      `\n**Single component costs ${ratio}% of the whole kit's JS and ${cssRatio}% of its CSS (gzipped).**` +
      `\n\n- Under ~15% on both: tree-shaking is working; stop worrying about payload.` +
      `\n- Over ~40% on either: something is defeating it — most likely a side-effectful` +
      ` module, a barrel re-export the bundler can't prove pure, or CSS that isn't` +
      ` per-component. That is worth more than every other optimisation combined.\n`
    );
  }

  // Everything below is derived from bundles that actually built. Saying
  // "no leaks" off zero successful builds would be worse than saying
  // nothing, so bail loudly instead.
  if (results.length === 0) {
    lines.push(
      `\n### No measurements\n\nEvery scenario failed to build, so there is nothing to report` +
      ` here — the errors above are the finding. Nothing below this line was measured.\n`
    );
    return results;
  }

  lines.push(`\n### Components that leaked in uninvited\n`);
  const anyLeak = results.filter((x) => x.r.leaked && x.r.leaked.length);
  if (anyLeak.length === 0) {
    lines.push('None — every bundle contained only what it imported.\n');
  } else {
    for (const x of anyLeak) {
      lines.push(`- **${x.s.name}** also contains: ${x.r.leaked.join(', ')}`);
    }
    lines.push(
      '\nNote this is a string-literal probe, so a name can appear because it is' +
      ' genuinely a dependency (Select really does need Menu). What matters is' +
      ' names with no plausible relationship to what was imported.\n'
    );
  }

  const total = Object.keys(ICON_MARKERS).length;
  lines.push(`\n### Icons per bundle (${total} probed)\n`);
  lines.push('| scenario | icons present | which |');
  lines.push('|---|---:|---|');
  for (const x of results) {
    const list = x.r.icons.length ? x.r.icons.join(', ') : '—';
    lines.push(`| ${x.s.name} | ${x.r.icons.length} | ${list} |`);
  }
  const everything = results.find((x) => x.s.exports === null);
  const worst = results
    .filter((x) => x.s.exports !== null)
    .reduce((a, x) => Math.max(a, x.r.icons.length), 0);
  lines.push(
    `\nRead it this way: a component pulling the one or two glyphs it actually` +
    ` renders is correct. The failure signal is a partial bundle carrying most` +
    ` of the ${total} — that would mean \`utils/icons.tsx\` is being taken` +
    ` wholesale instead of per-export.\n`
  );
  if (everything) {
    lines.push(
      `Whole kit: ${everything.r.icons.length}/${total}. Heaviest partial bundle:` +
      ` ${worst}/${total}.` +
      (worst >= total - 2
        ? ' **That is a leak** — split icons one per file.\n'
        : ' Per-export shaking is working.\n')
    );
  }
  return results;
}

// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const wantDist = args.includes('--dist') || args.includes('--both');
const wantSrc = !args.includes('--dist') || args.includes('--both');

let build;
try {
  ({ build } = await import('vite'));
} catch {
  console.error(
    'Could not load Vite from this package.\n' +
    'Run `pnpm install` in the repo root first, or from packages/terra run:\n' +
    '  pnpm add -D vite\n'
  );
  process.exit(1);
}

const lines = [
  '# Terra tree-shaking report',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Node: ${process.version}`,
  '',
  'React/ReactDOM are external in every scenario, so these numbers are Terra only.',
];

if (wantSrc) {
  await run('Source entry (workspace consumers)', join(pkgDir, 'src', 'index.ts'), build, lines);
}
if (wantDist) {
  const distEntry = join(pkgDir, 'dist', 'index.js');
  if (!existsSync(distEntry)) {
    lines.push('\n## Published entry (dist)\n\n`dist/index.js` not found — run `pnpm run build` first.\n');
    console.log('\n  dist/index.js not found; skipping (run `pnpm run build`).');
  } else {
    await run('Published entry (dist — what npm consumers get)', distEntry, build, lines);
  }
}

// Cheap extras worth having in the same file.
lines.push('\n## Source inventory\n');
try {
  const countLines = async (dir, pred) => {
    let n = 0, files = 0;
    const walk = async (d) => {
      for (const e of await readdir(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) { await walk(p); continue; }
        if (!pred(e.name)) continue;
        n += (await readFile(p, 'utf8')).split('\n').length; files++;
      }
    };
    await walk(dir);
    return { n, files };
  };
  const srcDir = join(pkgDir, 'src');
  const isProd = (f) => !/\.(test|ct|story)\./.test(f);
  const tsx = await countLines(srcDir, (f) => (f.endsWith('.tsx') || f.endsWith('.ts')) && isProd(f));
  const css = await countLines(srcDir, (f) => f.endsWith('.css'));
  lines.push(`- TS/TSX (excluding tests): ${fmt(tsx.n)} lines across ${tsx.files} files`);
  lines.push(`- CSS: ${fmt(css.n)} lines across ${css.files} files`);
} catch (e) {
  lines.push(`- inventory failed: ${e.message}`);
}

const outPath = join(pkgDir, 'treeshake-report.md');
await writeFile(outPath, lines.join('\n') + '\n');
console.log(`\nWrote ${outPath}`);
