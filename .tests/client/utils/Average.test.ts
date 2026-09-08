import { describe, expect, it } from "vitest";

import { Average } from "../../../client/src/utils/Average";


describe("Average", () => {
  it("averages multiple numbers", () => {
    expect(Average([2, 4, 6])).toBe(4);
  });

  it("returns the single value for a one-element array", () => {
    expect(Average([5])).toBe(5);
  });

  it("returns a fractional average when not evenly divisible", () => {
    expect(Average([1, 2])).toBe(1.5);
  });
});
