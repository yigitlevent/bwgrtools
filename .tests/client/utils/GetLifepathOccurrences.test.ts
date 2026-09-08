import { describe, expect, it } from "vitest";

import { GetLifepathOccurrences } from "../../../client/src/utils/GetLifepathOccurrences";


function LifepathWithId(id: number | null): Lifepath {
  return { id: id as unknown as dat.LifepathId | null } as Lifepath;
}

describe("GetLifepathOccurrences", () => {
  it("returns 1 for a single occurrence", () => {
    expect(GetLifepathOccurrences([LifepathWithId(1)])).toEqual([1]);
  });

  it("increments per repeated id, independently per id", () => {
    const lifepaths = [LifepathWithId(1), LifepathWithId(2), LifepathWithId(1), LifepathWithId(1), LifepathWithId(2)];
    expect(GetLifepathOccurrences(lifepaths)).toEqual([1, 1, 2, 3, 2]);
  });

  it("always treats a null id as occurrence 1", () => {
    const lifepaths = [LifepathWithId(null), LifepathWithId(null)];
    expect(GetLifepathOccurrences(lifepaths)).toEqual([1, 1]);
  });

  it("returns an empty array for no lifepaths", () => {
    expect(GetLifepathOccurrences([])).toEqual([]);
  });
});
