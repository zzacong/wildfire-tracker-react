# Wildfire Tracker — Wildland Ledger

A public wildfire-tracking map rebuilt as a TanStack Start + TypeScript app in the
**WILDLAND LEDGER** visual identity: a dark, calm situation-room map
(forest/panel/bone/signal-orange) over MapLibre GL + OpenFreeMap, fed by
**NASA EONET v3** through a BFF-cached server route.

The full product spec lives in `.scratch/modern-rebuild/spec.md`; implementation
progress is tracked in `.scratch/modern-rebuild/issues/07–16`.

## Stack

- **TanStack Start** + TypeScript (strict) — SSR first paint, server routes
- **Tailwind v4** + **shadcn/ui** — design tokens in `src/styles.css`
- **MapLibre GL** + OpenFreeMap basemap (v1 slices 09+)
- **Nitro** — deployment target (Vercel), SWR cache for the BFF route
- **pnpm** — package manager (`pnpm-lock.yaml` committed)
- **oxlint** + **oxfmt** — the lint/format gate (see `docs/adr/0001`)
- **Vitest** + React Testing Library — component tests

## Scripts

```sh
pnpm dev          # start the dev server on :3000
pnpm build        # production build
pnpm preview      # preview the production build
pnpm generate-routes  # regenerate routeTree.gen.ts
pnpm test         # run the test suite once
pnpm typecheck    # tsc --noEmit
pnpm lint         # oxlint --deny-warnings
pnpm format:check # oxfmt --check
pnpm format       # oxfmt --write
pnpm check        # all checks: lint + typecheck + format:check + test
```

The quality gate per slice is `pnpm check` — `oxlint --deny-warnings` +
`oxfmt --check` clean, typing clean, and the test seams green.
