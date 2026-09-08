import { describe, expect, it } from "vitest";

import { CreateDefaultLimits } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/createDefaultLimits";


describe("CreateDefaultLimits", () => {
  it("returns the baseline stock limits", () => {
    expect(CreateDefaultLimits()).toEqual({
      beliefs: 3,
      instincts: 3,
      stats: {
        Will: { min: 1, max: 8 },
        Perception: { min: 1, max: 8 },
        Power: { min: 1, max: 8 },
        Agility: { min: 1, max: 8 },
        Forte: { min: 1, max: 8 },
        Speed: { min: 1, max: 8 }
      },
      attributes: 9
    });
  });

  it("returns a fresh object each call", () => {
    const a = CreateDefaultLimits();
    const b = CreateDefaultLimits();
    expect(a).not.toBe(b);
    expect(a.stats).not.toBe(b.stats);
  });
});
