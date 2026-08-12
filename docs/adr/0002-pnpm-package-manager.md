# pnpm as the package manager

The repo ships on yarn today (CRA-era, `yarn.lock`), and the rebuild replaces CRA wholesale — the moment to set the package manager fresh. We chose **pnpm** for the rebuilt app: a content-addressable store (fast, disk-lean installs), strict non-hoisted `node_modules` that surfaces undeclared dependencies, and first-class support across the chosen stack (TanStack Start, Nitro, Vite).

## Status

accepted

## Considered Options

- **yarn (classic)** — the CRA default; rejected because nothing else in the stack recommends it and pnpm's strictness is a better fit for a public product.
- **npm** — slower installs and hoisting ambiguity; rejected for the same reasons pnpm wins.

## Consequences

- `pnpm-lock.yaml` is committed; all scripts/CI run through `pnpm`. The old `yarn.lock` is removed with the CRA app.
- Strict resolution may occasionally need explicit peer/`pnpm.overrides` handling during the build — expected and surfaced loudly, not silent.
