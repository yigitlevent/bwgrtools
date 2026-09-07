import { describe, expect, it } from "vitest";

import { Clamp } from "../../../client/src/utils/Clamp";


describe("Clamp", () => {
  it("returns the value when within range", () => {
    expect(Clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to the minimum when below range", () => {
    expect(Clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to the maximum when above range", () => {
    expect(Clamp(15, 0, 10)).toBe(10);
  });

  it("falls back to the minimum for NaN", () => {
    expect(Clamp(NaN, 2, 10)).toBe(2);
  });
});
