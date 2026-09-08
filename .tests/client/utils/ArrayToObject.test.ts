import { describe, expect, it } from "vitest";

import { ArrayToObject } from "../../../client/src/utils/ArrayToObject";


describe("ArrayToObject", () => {
  it("keys objects by their id property", () => {
    const arr = [{ id: "a", value: 1 }, { id: "b", value: 2 }];
    expect(ArrayToObject(arr)).toEqual({ a: { id: "a", value: 1 }, b: { id: "b", value: 2 } });
  });

  it("returns an empty object for an empty array", () => {
    expect(ArrayToObject([])).toEqual({});
  });

  it("keeps the last entry when ids collide", () => {
    const arr = [{ id: "a", value: 1 }, { id: "a", value: 2 }];
    expect(ArrayToObject(arr)).toEqual({ a: { id: "a", value: 2 } });
  });
});
