import { afterEach, describe, expect, it, vi } from "vitest";

import { RandomNumber } from "../../../client/src/utils/RandomNumber";


describe("RandomNumber", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns min when Math.random is just above 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.0001);
    expect(RandomNumber(1, 10)).toBe(1);
  });

  it("returns max when Math.random is just below 1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9999999999);
    expect(RandomNumber(1, 10)).toBe(10);
  });

  it("returns the fixed value when min equals max", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(RandomNumber(5, 5)).toBe(5);
  });

  it("always stays within [min, max] across many samples", () => {
    for (let i = 0; i < 1000; i++) {
      const result = RandomNumber(3, 7);
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(7);
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});
