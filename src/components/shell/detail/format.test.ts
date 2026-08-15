import { describe, expect, it } from "vitest";

import { formatAreaNote, formatAreaValue, formatDate, formatKindLabel, hostnameOf } from "./format";

describe("formatAreaValue", () => {
  it("formats large areas with thousands separators and no decimals", () => {
    expect(formatAreaValue({ value: 12400, sourceUnit: "acres" })).toBe("12,400");
  });

  it("keeps a decimal for small areas", () => {
    expect(formatAreaValue({ value: 45.7, sourceUnit: "acres" })).toBe("45.7");
  });

  it("drops decimals at 100 acres", () => {
    expect(formatAreaValue({ value: 250, sourceUnit: "hectares" })).toBe("250");
  });
});

describe("formatAreaNote", () => {
  it("flags hectares as the reported unit", () => {
    expect(formatAreaNote({ value: 10, sourceUnit: "hectares" })).toBe("reported in hectares");
  });

  it("returns null when area was reported in acres", () => {
    expect(formatAreaNote({ value: 10, sourceUnit: "acres" })).toBeNull();
  });
});

describe("formatDate", () => {
  it("formats ISO dates", () => {
    expect(formatDate("2026-08-12T00:00:00Z")).toBe("Aug 12, 2026");
  });

  it("falls back to the raw string for unparseable dates", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatKindLabel", () => {
  it("capitalizes single-word kinds", () => {
    expect(formatKindLabel("wildfire")).toBe("Wildfire");
  });

  it("maps multi-word kinds", () => {
    expect(formatKindLabel("severeStorm")).toBe("Severe storm");
  });
});

describe("hostnameOf", () => {
  it("extracts the hostname", () => {
    expect(hostnameOf("https://example.com/path")).toBe("example.com");
  });

  it("falls back to the raw value for invalid URLs", () => {
    expect(hostnameOf("not a url")).toBe("not a url");
  });
});
