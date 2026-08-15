# 01 - Scaffold TanStack Start app

Status: resolved
Blocked by: none

## Answer

Scaffolded TanStack Start + Tailwind v4 + shadcn/ui in place, replaced CRA `src/`, wired oxlint/oxfmt/vitest into `pnpm check`. Committed as `feat(scaffold): replace CRA app with TanStack Start + shadcn/ui` (squash-merged).

Scaffold the project in place (replacing CRA `src/`):

- `pnpm dlx @tanstack/cli@latest create` → TanStack Start, React, TypeScript, Tailwind add-on (provides `@/*` alias).
- `pnpm dlx shadcn@latest init`; add base components (button, sheet, popover, switch, skeleton, badge, scroll-area).
- Add oxlint + oxfmt; wire into `package.json` scripts (configs: `.oxlintrc.json`, `.oxfmtrc.json`).
- Add a `check` script in `package.json` that runs linting + formatting + type checking + tests in one command (`pnpm lint && pnpm fmt:check && pnpm typecheck && pnpm test`).
- Verify `pnpm check` passes and `pnpm dev` serves a default route; `routeTree.gen.ts` regenerates and is committed.
- Remove leftover CRA artifacts (react-scripts, yarn.lock, index.css, google-map-react, spinner).
