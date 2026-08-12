# 07 — Scaffold & WILDLAND LEDGER design system

**What to build:** The rebuilt app boots as a TanStack Start + TypeScript project styled in the locked WILDLAND LEDGER visual language (tickets 03/06) — the dark-primary situation-room shell every later slice fills in. This is the foundation: nothing below starts until the app runs, the design tokens are real, and the lint/format gate is wired. Package management moves to pnpm and the CRA-era ESLint config is retired here.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Project boots on TanStack Start + TypeScript (strict) + Tailwind v4 + shadcn/ui; dev server and production build pass; managed with **pnpm** (`pnpm-lock.yaml` committed, `yarn.lock` and the CRA `package.json` eslintConfig/scripts retired — no ESLint, no Prettier in the rebuild).
- [ ] Lint gate (ADR 0001): **oxlint** installed, configured to enforce the `correctness` category plus the `react` and `jsx-a11y` plugins; `oxlint --deny-warnings` passes clean across the scaffolded source.
- [ ] Format gate (ADR 0001): **oxfmt** installed, configured (printWidth 80, Tailwind class + import sorting on); `oxfmt --check` passes clean.
- [ ] Design tokens encoded: forest `#11160f` (bg), panel `#1a2118`, hairline borders `rgba(242,236,226,.12)`/`.22`, bone `#f1ece2`, muted `#a7b09d`, **faint `#828c70`** (AA-bumped, not `#70795f`), signal-orange accent `#f2672b` (single accent); `#13160f` on accent for active chips.
- [ ] Type: Space Grotesk 400/500/700 for display + UI (display weight 700, `-0.02em` tracking); JetBrains Mono 10–13px for all data values.
- [ ] Radii scale (sharp 0–8px rows/ticker, 14px cards) and flat elevation (hairline borders, no drop shadows except the fire glow).
- [ ] One focus-ring token (2px bone outline + 2px offset, `:focus-visible` only) applied to the shell's controls.
- [ ] `prefers-reduced-motion: reduce` cuts all animation/transition to `0ms`.
- [ ] Dark-primary shell renders: empty masthead, 372px ledger-rail area, bottom burn-ticker area, and the map surface. Not themeable.
