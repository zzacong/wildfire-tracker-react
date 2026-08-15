import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("joins class names and drops falsy values", () => {
    const falsy = false;
    expect(cn("a", undefined, "b")).toBe("a b");
    expect(cn("a", falsy && "b", null, "c")).toBe("a c");
  });

  it("resolves conflicting tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
