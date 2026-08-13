# oxlint + oxfmt as the lint/format toolchain

The rebuilt app needs a lint/format gate, and the spec deferred the tool choice. We chose the Oxc pair — **oxlint** for linting, **oxfmt** for formatting — over ESLint + Prettier. Both are Rust-native (an order of magnitude faster, so the per-PR gate stays cheap), oxlint is stable (v1.78) with correctness-on-by-default plus `react`/`jsx-a11y` plugins, and oxfmt is Prettier-conformant (passes 100% of Prettier's JS/TS conformance tests) with built-in Tailwind class + import sorting — removing the Prettier-plugin config tax that shadcn/Tailwind normally drags in.

## Status

accepted

## Considered Options

- **ESLint + Prettier** — the ecosystem default; rejected for speed and the plugin/config tax (Tailwind + import-order plugins, two config files, slow CI).
- **Biome** — fast and integrated, but a third lint/format axis to learn and a smaller rule surface than oxlint's ~850 built-in rules.

## Consequences

- Config lives at scaffold (ticket 07): `.oxlintrc.json` + `.oxfmtrc.json`, npm packages `oxlint` and `oxfmt`.
- Oxfmt is still **beta** (v0.63, not 1.0); both tools are pinned so the CLI and the `oxc.oxc-vscode` editor extension never drift.
- Enforced gate per-PR: `oxlint --deny-warnings` (correctness + `react` + `jsx-a11y`) and `oxfmt --check` (printWidth 80, Tailwind + import sorting) must pass clean. The `pnpm check` script runs lint + typecheck + format:check + test together. CI wiring itself stays out of scope (spec "Out of scope").
