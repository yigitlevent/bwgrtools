import { afterEach, describe, expect, it, vi } from "vitest";

import { RandomInteger } from "../../../client/src/utils/RandomInteger";


describe("RandomInteger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns min when Math.random is just above 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.0001);
    expect(RandomInteger(1, 10)).toBe(1);
  });

  it("returns max when Math.random is just below 1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9999999999);
    expect(RandomInteger(1, 10)).toBe(10);
  });

  it("returns the fixed value when min equals max", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(RandomInteger(5, 5)).toBe(5);
  });

  it("always stays within [min, max] across many samples", () => {
    for (let i = 0; i < 1000; i++) {
      const result = RandomInteger(3, 7);
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(7);
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});
