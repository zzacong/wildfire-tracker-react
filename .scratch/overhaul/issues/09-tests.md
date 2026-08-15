# 09 - Tests: unit (Vitest)

Status: resolved
Blocked by: 02, 08

Scope note (2026-08-15): Playwright e2e dropped by decision — unit tests via Vitest are sufficient for this release.

## Answer

Vitest coverage extended across data normalization, area unit conversion (acres/hectares), status derivation, 1000-cap logic, and filter normalization (18 new tests, 87 total). Fixed `normalizeEvent` empty-string `closed` bug. Committed as `test: complete vitest unit coverage for data layer` (squash-merged).

- Vitest: data normalization, area unit conversion, status derivation, cap logic, filter logic.
