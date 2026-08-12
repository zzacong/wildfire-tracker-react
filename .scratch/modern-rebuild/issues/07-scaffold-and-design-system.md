# 07 — Scaffold & WILDLAND LEDGER design system

**What to build:** The rebuilt app boots as a TanStack Start + TypeScript project styled in the locked WILDLAND LEDGER visual language (tickets 03/06) — the dark-primary situation-room shell every later slice fills in. This is the foundation: nothing below starts until the app runs, the design tokens are real, and the lint/format gate is wired. Package management moves to pnpm and the CRA-era ESLint config is retired here.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [x] Project boots on TanStack Start + TypeScript (strict) + Tailwind v4 + shadcn/ui; dev server and production build pass; managed with **pnpm** (`pnpm-lock.yaml` committed, `yarn.lock` and the CRA `package.json` eslintConfig/scripts retired — no ESLint, no Prettier in the rebuild).
- [x] Lint gate (ADR 0001): **oxlint** installed, configured to enforce the `correctness` category plus the `react` and `jsx-a11y` plugins; `oxlint --deny-warnings` passes clean across the scaffolded source.
- [x] Format gate (ADR 0001): **oxfmt** installed, configured (printWidth 80, Tailwind class + import sorting on); `oxfmt --check` passes clean.
- [x] Design tokens encoded: forest `#11160f` (bg), panel `#1a2118`, hairline borders `rgba(242,236,226,.12)`/`.22`, bone `#f1ece2`, muted `#a7b09d`, **faint `#828c70`** (AA-bumped, not `#70795f`), signal-orange accent `#f2672b` (single accent); `#13160f` on accent for active chips.
- [x] Type: Space Grotesk 400/500/700 for display + UI (display weight 700, `-0.02em` tracking); JetBrains Mono 10–13px for all data values.
- [x] Radii scale (sharp 0–8px rows/ticker, 14px cards) and flat elevation (hairline borders, no drop shadows except the fire glow).
- [x] One focus-ring token (2px bone outline + 2px offset, `:focus-visible` only) applied to the shell's controls.
- [x] `prefers-reduced-motion: reduce` cuts all animation/transition to `0ms`.
- [x] Dark-primary shell renders: empty masthead, 372px ledger-rail area, bottom burn-ticker area, and the map surface. Not themeable.

## Implementation notes

- Scaffold from the TanStack Start Vite/Nitro base (pnpm): `package.json`, `tsconfig.json` (strict), `vite.config.ts`, `tsr.config.json`, `src/router.tsx`, `src/routes/__root.tsx` (dark-primary `RootDocument`, no theme script), `src/routes/index.tsx` → `<AppShell />`.
- WILDLAND LEDGER tokens live in `src/styles.css` as Tailwind v4 `@theme` (color/font/radius) plus the spec-named custom props (`--c-faint`, `--focus-ring`, `--marker-halo`, `--motion-reduce`). A shadcn `@theme inline` semantic layer maps `--background/--foreground/--primary/--border/...` to the same palette so components added in later tickets stay in-palette.
- Shell components under `src/components/shell/`: `AppShell` (flex layout), `Masthead` (empty brand head with LIVE pulse), `LedgerRail` (372px rail + empty entries region), `BurnTicker` (bottom strip), `MapSurface` (map region; MapLibre lands in 09). Shared `FlameIcon` glyph.
- Fonts self-hosted via `@fontsource` (Space Grotesk 400/500/700, JetBrains Mono 400/500) — no runtime font CDN dependency.
- Tools: `.oxlintrc.json` (correctness error + react + jsx-a11y plugins), `.oxfmtrc.json` (printWidth 80, singleQuote, sortImports, sortTailwindcss, ignores `.scratch/ docs/ prototypes/` and the generated `routeTree.gen.ts`). `pnpm-workspace.yaml` carries `onlyBuiltDependencies`. VSCode defaults to the `oxc.oxc-vscode` formatter.
- Test harness: Vitest + jsdom + React Testing Library (`vitest.config.ts`, `src/test/setup.ts`), smoke test for `AppShell` rendering the five shell regions.
- Quality gate verified: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm dev`, `pnpm build` all pass.
