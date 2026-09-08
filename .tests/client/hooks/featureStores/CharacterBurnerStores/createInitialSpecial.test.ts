import { describe, expect, it } from "vitest";

import { CreateInitialSpecial } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/createInitialSpecial";


describe("CreateInitialSpecial", () => {
  it("returns the baseline special-options state", () => {
    const special = CreateInitialSpecial();

    expect(special.stock).toEqual({ brutalLifeTraits: [], huntingGround: undefined });
    expect(special.companionLifepath).toEqual({});
    expect(special.variableAge).toEqual({});
    expect(special.servantOfCitadelQualifies).toBe(false);
    expect(special.swornToProtectQualifies).toBe(false);
    expect(special.avariceGreed).toBeUndefined();
    expect(special.mournerGrief).toBeUndefined();
  });

  it("returns independent objects on each call", () => {
    const a = CreateInitialSpecial();
    const b = CreateInitialSpecial();
    expect(a).not.toBe(b);
    expect(a.stock).not.toBe(b.stock);
    a.stock.brutalLifeTraits.push("No Trait");
    expect(b.stock.brutalLifeTraits).toEqual([]);
  });
});
