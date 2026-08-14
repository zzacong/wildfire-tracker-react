# 01 - Scaffold TanStack Start app

Status: claimed
Blocked by: none

Scaffold the project in place (replacing CRA `src/`):

- `pnpm dlx @tanstack/cli@latest create` → TanStack Start, React, TypeScript, Tailwind add-on (provides `@/*` alias).
- `pnpm dlx shadcn@latest init`; add base components (button, sheet, popover, switch, skeleton, badge, scroll-area).
- Add oxlint + oxfmt; wire into `package.json` scripts.
- Add a `check` script in `package.json` that runs linting + formatting + type checking + tests in one command (e.g. `oxlint . && oxfmt --check . && tsc --noEmit && vitest run`).
- Verify `pnpm check` passes and `pnpm dev` serves a default route; `routeTree.gen.ts` regenerates and is committed.
- Remove leftover CRA artifacts (react-scripts, yarn.lock, index.css, google-map-react, spinner).
