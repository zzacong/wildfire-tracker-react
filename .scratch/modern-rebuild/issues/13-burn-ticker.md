# 13 — Burn ticker

**What to build:** The bottom burn-ticker of live aggregates (tickets 03/06) — a JetBrains Mono strip showing the count for the visible (derived) set, reflective of filters and search, announced politely to screen readers only when aggregates change. (The active/closed split lands with ticket 15.)

**Blocked by:** 11 — Filters & search on the derived set.

**Status:** resolved

- [x] Bottom ticker strip shows the count aggregate for the visible set; numbers update with filters/search.
- [x] `aria-live="polite"` region announcing **changed aggregates only** on a 5m poll (no full re-announcement).
- [x] Data rendered in JetBrains Mono, dense stat-cell layout per the design tokens.
- [x] Pulse/glow animation cut to `0ms` under `prefers-reduced-motion`.
- [x] Passes the quality gate: `oxlint --deny-warnings` and `oxfmt --check` clean on this slice's changes.

## Answer

`BurnTicker` (`src/components/shell/BurnTicker.tsx`) now takes `fires: Fire[]` plus an optional `dataUpdatedAt: number | null` (the query's `dataUpdatedAt`, threaded from `AppShell`) and renders the count of the visible set in a dense JetBrains Mono stat cell — hairline top border + panel background (kept from the placeholder footer), `text-[10px]` tracking-wide uppercase faint label "Active fires", `text-[20px]` mono bone value. `aria-label="Burn ticker"` is preserved on the footer. `AppShell` passes `visibleFires` (the derived set after filters ∧ search, already computed there) and `dataUpdatedAt > 0 ? dataUpdatedAt : null`.

The polite live region is an `<output aria-live="polite" aria-atomic="true">` (implicit `status` role; oxlint prefers the `output` tag) that is visually hidden via `sr-only` and stays empty unless the gated condition fires. Announcements are gated in a `useEffect`: a ref holds the last poll's `{ dataUpdatedAt, count }`; the live region is only written when `dataUpdatedAt` advances (a poll-driven dataset refresh) **and** the count changed — never on a filter/search render (same `dataUpdatedAt`), never on first data arrival, never on a poll that leaves the count unchanged. The visible number always updates; only the SR announcement is gated.

Reduced motion is covered by the global rule already in `src/styles.css` (`@media (prefers-reduced-motion: reduce)` sets `animation-duration`/`transition-duration` to `var(--motion-reduce)` for every element); the guard test in `BurnTicker.test.tsx` verifies that rule applies.

Tests (`src/components/shell/BurnTicker.test.tsx`, Vitest + RTL, seeded `fire()` fixtures): count renders for the visible set, count updates on prop change, the polite live region exists (`aria-live="polite"` + `aria-atomic="true"`), announcements only fire on a poll-driven aggregate change (filter-driven rerenders and unchanged-poll rerenders stay silent), first data arrival is not announced, and the reduced-motion global rule is verified. 7 tests added; `AppShell.test.tsx` untouched. `pnpm check` green (78 tests) and `pnpm build` passes.
