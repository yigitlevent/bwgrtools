import { describe, expect, it } from "vitest";

import { RecordGet } from "../../../client/src/utils/RecordGet";


describe("RecordGet", () => {
  it("returns the value for an existing key", () => {
    expect(RecordGet({ a: 1, b: 2 }, "a")).toBe(1);
  });

  it("returns undefined for a missing key", () => {
    expect(RecordGet<string, number>({ a: 1 }, "missing")).toBeUndefined();
  });
});
