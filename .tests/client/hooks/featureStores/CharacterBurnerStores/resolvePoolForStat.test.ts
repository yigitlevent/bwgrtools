import { describe, expect, it, vi } from "vitest";

import { ResolvePoolForStat } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/resolvePoolForStat";


describe("ResolvePoolForStat", () => {
  it("resolves the mental pool for Mental-pool stats", () => {
    const mental: Points = { total: 10, spent: 2, remaining: 8 };
    const getMentalPool = vi.fn().mockReturnValue(mental);
    const getPhysicalPool = vi.fn();

    expect(ResolvePoolForStat("Mental", getMentalPool, getPhysicalPool)).toBe(mental);
    expect(getPhysicalPool).not.toHaveBeenCalled();
  });

  it("resolves the physical pool for Physical-pool stats", () => {
    const physical: Points = { total: 10, spent: 2, remaining: 8 };
    const getMentalPool = vi.fn();
    const getPhysicalPool = vi.fn().mockReturnValue(physical);

    expect(ResolvePoolForStat("Physical", getMentalPool, getPhysicalPool)).toBe(physical);
    expect(getMentalPool).not.toHaveBeenCalled();
  });
});
