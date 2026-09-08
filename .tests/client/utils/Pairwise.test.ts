import { describe, expect, it } from "vitest";

import { Pairwise } from "../../../client/src/utils/Pairwise";


describe("Pairwise", () => {
  it("returns consecutive pairs", () => {
    expect(Pairwise([1, 2, 3, 4])).toEqual([[1, 2], [2, 3], [3, 4]]);
  });

  it("returns an empty array for a single-element array", () => {
    expect(Pairwise([1])).toEqual([]);
  });

  it("returns an empty array for an empty array", () => {
    expect(Pairwise([])).toEqual([]);
  });
});
