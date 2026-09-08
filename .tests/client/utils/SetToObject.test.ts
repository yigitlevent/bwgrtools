import { describe, expect, it } from "vitest";

import { SetToObject } from "../../../client/src/utils/SetToObject";


describe("SetToObject", () => {
  it("keys objects by their id property", () => {
    const set = new Set([{ id: "a", value: 1 }, { id: "b", value: 2 }]);
    expect(SetToObject(set)).toEqual({ a: { id: "a", value: 1 }, b: { id: "b", value: 2 } });
  });

  it("returns an empty object for an empty set", () => {
    expect(SetToObject(new Set<{ id: string; }>())).toEqual({});
  });
});
