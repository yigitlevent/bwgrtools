import { describe, expect, it } from "vitest";

import { GetLifepathYears } from "../../../client/src/utils/GetLifepathYears";


function LifepathWithYears(id: number | null, years: number | number[]): Lifepath {
  return { id: id as unknown as dat.LifepathId | null, years } as Lifepath;
}

describe("GetLifepathYears", () => {
  it("returns the fixed years value directly", () => {
    expect(GetLifepathYears(LifepathWithYears(1, 5), {})).toBe(5);
  });

  it("returns the player-chosen variableAge value for a variable-year lifepath", () => {
    const id = 1 as unknown as dat.LifepathId;
    const lifepath = LifepathWithYears(1, [1, 10]);
    expect(GetLifepathYears(lifepath, { [id]: 7 })).toBe(7);
  });

  it("falls back to the minimum of the range when unchosen", () => {
    expect(GetLifepathYears(LifepathWithYears(1, [2, 10]), {})).toBe(2);
  });

  it("falls back to the minimum when the lifepath id is null", () => {
    expect(GetLifepathYears(LifepathWithYears(null, [3, 10]), {})).toBe(3);
  });
});
