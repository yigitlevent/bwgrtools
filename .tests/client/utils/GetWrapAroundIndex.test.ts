import { describe, expect, it } from "vitest";

import { GetWrapAroundIndex } from "../../../client/src/utils/GetWrapAroundIndex";


// GetWrapAroundIndex computes `(-index) mod length` (via `length^10 - index`, and length^10 is
// always divisible by length) -- it does NOT return in-range indices unchanged. These tests pin
// down that actual behavior rather than the "identity for in-range values" behavior the name
// might suggest.
describe("GetWrapAroundIndex", () => {
  it("returns 0 for index 0", () => {
    expect(GetWrapAroundIndex(0, 5)).toBe(0);
  });

  it("returns 0 when index equals length", () => {
    expect(GetWrapAroundIndex(5, 5)).toBe(0);
  });

  it("wraps a positive in-range index to length - index", () => {
    expect(GetWrapAroundIndex(2, 5)).toBe(3);
  });

  it("wraps an index greater than length using the same (-index mod length) rule", () => {
    expect(GetWrapAroundIndex(6, 5)).toBe(4);
  });

  it("wraps a negative index to its absolute value mod length", () => {
    expect(GetWrapAroundIndex(-1, 5)).toBe(1);
  });

  it("floors non-integer index and length before computing", () => {
    expect(GetWrapAroundIndex(2.9, 5.9)).toBe(3);
  });

  it("always returns a value in [0, length)", () => {
    for (let i = -10; i <= 10; i++) {
      const result = GetWrapAroundIndex(i, 5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(5);
    }
  });
});
