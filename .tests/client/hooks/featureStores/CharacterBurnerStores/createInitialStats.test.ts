import { describe, expect, it } from "vitest";

import { CreateInitialStats } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/createInitialStats";


describe("CreateInitialStats", () => {
  it("returns all six stats zeroed out", () => {
    const stats = CreateInitialStats();
    expect(Object.keys(stats).sort()).toEqual(["Agility", "Forte", "Perception", "Power", "Speed", "Will"].sort());
    Object.values(stats).forEach(stat => {
      expect(stat.shadeShifted).toBe(false);
      expect(stat.mainPoolSpent).toEqual({ shade: 0, exponent: 0 });
      expect(stat.eitherPoolSpent).toEqual({ shade: 0, exponent: 0 });
    });
  });

  it("assigns the correct pool type per stat", () => {
    const stats = CreateInitialStats();
    expect(stats.Will.poolType).toBe("Mental");
    expect(stats.Perception.poolType).toBe("Mental");
    expect(stats.Power.poolType).toBe("Physical");
    expect(stats.Agility.poolType).toBe("Physical");
    expect(stats.Forte.poolType).toBe("Physical");
    expect(stats.Speed.poolType).toBe("Physical");
  });

  it("returns independent objects on each call", () => {
    const a = CreateInitialStats();
    const b = CreateInitialStats();
    a.Will.shadeShifted = true;
    expect(b.Will.shadeShifted).toBe(false);
  });
});
