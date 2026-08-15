import { describe, expect, it } from "vitest";

import {
  DEFAULT_HAZARD_KIND,
  normalizeHazardFilters,
  parseHazardFiltersSearch,
  type StatusFilter,
} from "./hazard-filters";
import type { Kind } from "./hazard-event";

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

  it("keeps an explicit open status and drops empty-string dates", () => {
    expect(normalizeHazardFilters({ status: "open", start: "", end: "" })).toEqual({
      status: "open",
      kind: "wildfire",
      start: undefined,
      end: undefined,
    });
  });

  it("falls back to open for unknown status values", () => {
    expect(normalizeHazardFilters({ status: "everything" as StatusFilter }).status).toBe("open");
    expect(normalizeHazardFilters({ status: "closed" as StatusFilter }).status).toBe("open");
  });

  it("falls back to the default kind for empty or missing kinds", () => {
    expect(normalizeHazardFilters({ kind: "" as Kind }).kind).toBe(DEFAULT_HAZARD_KIND);
    expect(normalizeHazardFilters({ kind: undefined }).kind).toBe(DEFAULT_HAZARD_KIND);
  });

  it("accepts only real calendar dates", () => {
    expect(normalizeHazardFilters({ start: "2024-02-29" }).start).toBe("2024-02-29");
    expect(normalizeHazardFilters({ start: "2026-02-29" }).start).toBeUndefined();
    expect(normalizeHazardFilters({ start: "2026-00-10" }).start).toBeUndefined();
    expect(normalizeHazardFilters({ start: "2026-13-01" }).start).toBeUndefined();
    expect(normalizeHazardFilters({ start: "2026-08-01 " }).start).toBeUndefined();
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

  it("rejects unwired or non-string kind values", () => {
    expect(parseHazardFiltersSearch({ kind: "flood" }).kind).toBeUndefined();
    expect(parseHazardFiltersSearch({ kind: 42 }).kind).toBeUndefined();
  });
});
