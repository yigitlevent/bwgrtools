import { describe, expect, it } from "vitest";

import { GetOrdinalSuffix } from "../../../client/src/utils/GetOrdinalSuffix";


describe("GetOrdinalSuffix", () => {
  it.each([
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [11, "11th"],
    [12, "12th"],
    [13, "13th"],
    [21, "21st"],
    [22, "22nd"],
    [23, "23rd"],
    [101, "101st"],
    [111, "111th"],
    [112, "112th"],
    [113, "113th"],
    [0, "0th"]
  ])("formats %i as %s", (input, expected) => {
    expect(GetOrdinalSuffix(input)).toBe(expected);
  });
});
