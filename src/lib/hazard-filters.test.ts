import { describe, expect, it } from "vitest";

import {
  DEFAULT_HAZARD_KIND,
  normalizeHazardFilters,
  parseHazardFiltersSearch,
} from "./hazard-filters";

describe("normalizeHazardFilters", () => {
  it("defaults to open-only wildfire when no input is given", () => {
    expect(normalizeHazardFilters(undefined)).toEqual({
      status: "open",
      kind: "wildfire",
      start: undefined,
      end: undefined,
    });
  });

  it("drops unsupported kinds back to the default", () => {
    expect(normalizeHazardFilters({ kind: "flood" }).kind).toBe(DEFAULT_HAZARD_KIND);
    expect(normalizeHazardFilters({ kind: "wildfire" }).kind).toBe("wildfire");
  });

  it("rejects malformed dates", () => {
    expect(normalizeHazardFilters({ start: "not-a-date", end: "2026-13-40" })).toMatchObject({
      start: undefined,
      end: undefined,
    });
    expect(normalizeHazardFilters({ start: "2026-08-01" }).start).toBe("2026-08-01");
  });
});

describe("parseHazardFiltersSearch", () => {
  it("reads known search params and ignores anything else", () => {
    expect(
      parseHazardFiltersSearch({
        status: "recently-closed",
        kind: "wildfire",
        start: "2026-08-01",
        end: "2026-08-14",
        unknown: "nope",
      }),
    ).toEqual({
      status: "recently-closed",
      kind: "wildfire",
      start: "2026-08-01",
      end: "2026-08-14",
    });
  });

  it("returns undefined fields for absent or invalid values", () => {
    expect(parseHazardFiltersSearch({ status: "everything", start: 42 })).toEqual({
      status: undefined,
      kind: undefined,
      start: undefined,
      end: undefined,
    });
  });
});
