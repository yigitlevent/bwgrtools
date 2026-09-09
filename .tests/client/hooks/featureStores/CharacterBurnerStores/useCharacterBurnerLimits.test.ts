import { beforeEach, describe, expect, it } from "vitest";

import { AbilityIds, SeedRuleset, StockIds } from "./_fixtures/ruleset";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLimitsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLimits";
import { useCharacterBurnerSpecialStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";


function setTraits(names: string[]): void {
  useCharacterBurnerTraitStore.setState({
    traits: new UniqueArray<dat.TraitId, CharacterTrait>(
      names.map((name, i) => ({ id: i as dat.TraitId, name, type: "General", isOpen: true }))
    )
  });
}

function setPowerForte(power: number, forte: number): void {
  useCharacterBurnerStatStore.setState({
    stats: {
      ...useCharacterBurnerStatStore.getState().stats,
      Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: power }, eitherPoolSpent: { shade: 0, exponent: 0 } },
      Forte: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: forte }, eitherPoolSpent: { shade: 0, exponent: 0 } }
    }
  });
}

describe("useCharacterBurnerLimitsStore.getTolerances", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
  });

  describe("refreshLimits special-option stat caps", () => {
    beforeEach(() => {
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });
      useCharacterBurnerSpecialStore.getState().reset();
      useCharacterBurnerLimitsStore.getState().reset();
    });

    it("caps the Crippled-chosen stat at exponent 4", () => {
      setTraits(["Crippled"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, crippledStat: AbilityIds.Forte } });

      useCharacterBurnerLimitsStore.getState().refreshLimits();

      expect(useCharacterBurnerLimitsStore.getState().limits.stats.Forte).toEqual({ min: 1, max: 4 });
    });

    it("caps the Frail-chosen stat at exponent 5", () => {
      setTraits(["Frail"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, frailStat: AbilityIds.Power } });

      useCharacterBurnerLimitsStore.getState().refreshLimits();

      expect(useCharacterBurnerLimitsStore.getState().limits.stats.Power).toEqual({ min: 1, max: 5 });
    });

    it("caps Agility at 5 for a missing arm", () => {
      setTraits(["Missing Limb"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, missingLimb: AbilityIds.Agility } });

      useCharacterBurnerLimitsStore.getState().refreshLimits();

      expect(useCharacterBurnerLimitsStore.getState().limits.stats.Agility).toEqual({ min: 1, max: 5 });
    });

    it("caps Speed at 4 for a missing leg", () => {
      setTraits(["Missing Limb"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, missingLimb: AbilityIds.Speed } });

      useCharacterBurnerLimitsStore.getState().refreshLimits();

      expect(useCharacterBurnerLimitsStore.getState().limits.stats.Speed).toEqual({ min: 1, max: 4 });
    });

    it("does not apply Crippled/Frail/Missing Limb caps when the trait is open but no stat is chosen yet", () => {
      setTraits(["Crippled", "Frail", "Missing Limb"]);

      useCharacterBurnerLimitsStore.getState().refreshLimits();

      const { limits } = useCharacterBurnerLimitsStore.getState();
      expect(limits.stats.Forte).toEqual({ min: 1, max: 8 });
      expect(limits.stats.Power).toEqual({ min: 1, max: 8 });
      expect(limits.stats.Agility).toEqual({ min: 1, max: 8 });
    });

    it("does not apply Crippled/Frail caps when the chosen ability resolves to a falsy name", () => {
      const namelessId = 12345 as dat.AbilityId;
      useRulesetStore.setState({
        abilitiesById: new Map([...useRulesetStore.getState().abilitiesById, [namelessId, { id: namelessId, name: null, abilityType: [0 as dat.AbilityTypeId, "Attribute"], hasShades: false }]])
      });
      setTraits(["Crippled", "Frail"]);
      useCharacterBurnerSpecialStore.setState({
        special: { ...useCharacterBurnerSpecialStore.getState().special, crippledStat: namelessId, frailStat: namelessId }
      });

      useCharacterBurnerLimitsStore.getState().refreshLimits();

      const { limits } = useCharacterBurnerLimitsStore.getState();
      expect(limits.stats.Forte).toEqual({ min: 1, max: 8 });
      expect(limits.stats.Power).toEqual({ min: 1, max: 8 });
    });

    it("does not cap Agility/Speed for Missing Limb when the limb resolves to neither Agility nor Speed", () => {
      setTraits(["Missing Limb"]);
      useCharacterBurnerSpecialStore.setState({
        special: { ...useCharacterBurnerSpecialStore.getState().special, missingLimb: AbilityIds.Perception }
      });

      useCharacterBurnerLimitsStore.getState().refreshLimits();

      const { limits } = useCharacterBurnerLimitsStore.getState();
      expect(limits.stats.Agility).toEqual({ min: 1, max: 8 });
      expect(limits.stats.Speed).toEqual({ min: 1, max: 8 });
    });
  });

  it("returns a 16-entry array", () => {
    setPowerForte(4, 4);
    const result = useCharacterBurnerLimitsStore.getState().getTolerances();
    expect(result.length).toBe(16);
  });

  it("places MW at floor(avg(power,forte)) + 6 without Tough", () => {
    setPowerForte(4, 4);
    // avg(4,4)=4, floor=4, +6=10
    const result = useCharacterBurnerLimitsStore.getState().getTolerances();
    expect(result[10]).toBe("MW");
  });

  it("uses ceil instead of floor for the MW derivation when Tough is open", () => {
    setTraits(["Tough"]);
    setPowerForte(3, 4);
    // avg(3,4)=3.5, ceil=4, +6=10 (vs floor=3,+6=9 without Tough)
    const result = useCharacterBurnerLimitsStore.getState().getTolerances();
    expect(result[10]).toBe("MW");
    expect(result[9]).not.toBe("MW");
  });

  it("marks the tiers below MW as Traumatic/Severe/Midi/Light/Superficial in descending order", () => {
    setPowerForte(6, 6);
    // avg(6,6)=6, MW=12; superficial = floor(6/2)+1=4
    const result = useCharacterBurnerLimitsStore.getState().getTolerances();

    expect(result[12]).toBe("MW");
    expect(result[11]).toBe("Tr");
    expect(result[4]).toBe("Su");
    // entries before superficial and after MW remain the placeholder
    expect(result[0]).toBe("—");
    expect(result[15]).toBe("—");
  });

  it("shrinks tier gaps below maxDistance to fit closely-spaced tiers at low Forte", () => {
    setPowerForte(1, 1);
    // forte=1: maxDistance=ceil(1/2)=1, superficial=floor(1/2)+1=1, MW=floor(avg(1,1))+6=7
    // Naive traumatic=6,severe=5,midi=4,light=3 would leave gaps > 1 from superficial(1) -- the
    // while-loops shrink each tier down until every gap is <= maxDistance.
    const result = useCharacterBurnerLimitsStore.getState().getTolerances();

    expect(result[7]).toBe("MW");
    expect(result[1]).toBe("Su");
    // No gaps should be left unfilled between superficial and MW given maxDistance shrinking.
    const filledRange = result.slice(1, 7);
    expect(filledRange.every(v => v !== "—")).toBe(true);
  });

  it("produces a monotonically-non-decreasing severity ordering across the tier labels present", () => {
    setPowerForte(8, 8);
    const order = ["Su", "Li", "Mi", "Se", "Tr", "MW"];
    const result = useCharacterBurnerLimitsStore.getState().getTolerances();

    const seenIndices = order.map(label => result.indexOf(label)).filter(i => i >= 0);
    const sorted = [...seenIndices].sort((a, b) => a - b);
    expect(seenIndices).toEqual(sorted);
  });
});
