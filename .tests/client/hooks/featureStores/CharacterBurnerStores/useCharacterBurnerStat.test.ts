import { beforeEach, describe, expect, it } from "vitest";

import { AbilityIds, SeedRuleset } from "./_fixtures/ruleset";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { CreateInitialStats } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/createInitialStats";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
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

describe("useCharacterBurnerStatStore", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerLimitsStore.getState().reset();
  });

  describe("reset", () => {
    it("resets stats to the initial state", () => {
      useCharacterBurnerStatStore.setState({
        stats: { Will: { poolType: "Mental", shadeShifted: true, mainPoolSpent: { shade: 1, exponent: 2 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      useCharacterBurnerStatStore.getState().reset();

      expect(useCharacterBurnerStatStore.getState().stats).toEqual(CreateInitialStats());
    });
  });

  describe("getStat", () => {
    it("returns base shade B and exponent 0 for a fresh stat", () => {
      expect(useCharacterBurnerStatStore.getState().getStat("Will")).toEqual({ shade: "B", exponent: 0 });
    });

    it("returns shade G when shadeShifted", () => {
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Will: { poolType: "Mental", shadeShifted: true, mainPoolSpent: { shade: 0, exponent: 3 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      expect(useCharacterBurnerStatStore.getState().getStat("Will")).toEqual({ shade: "G", exponent: 3 });
    });

    it("sums main and either pool spent exponents", () => {
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Will: { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 2 }, eitherPoolSpent: { shade: 0, exponent: 3 } } }
      });

      expect(useCharacterBurnerStatStore.getState().getStat("Will").exponent).toBe(5);
    });

    it("applies a -1 penalty to Agility for Missing Hand", () => {
      setTraits(["Missing Hand"]);
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Agility: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 4 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      expect(useCharacterBurnerStatStore.getState().getStat("Agility").exponent).toBe(3);
    });

    it("does not penalize other stats for Missing Hand", () => {
      setTraits(["Missing Hand"]);
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 4 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      expect(useCharacterBurnerStatStore.getState().getStat("Power").exponent).toBe(4);
    });

    it("applies a -1 penalty to the Frail-chosen stat", () => {
      setTraits(["Frail"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, frailStat: AbilityIds.Forte } });
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Forte: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 5 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      expect(useCharacterBurnerStatStore.getState().getStat("Forte").exponent).toBe(4);
    });

    it("does not apply Frail penalty when frailStat is undefined", () => {
      setTraits(["Frail"]);
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Forte: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 5 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      expect(useCharacterBurnerStatStore.getState().getStat("Forte").exponent).toBe(5);
    });

    it("applies a +3 bonus to the Child Prodigy-chosen stat", () => {
      setTraits(["Child Prodigy"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, childProdigyStat: AbilityIds.Perception } });
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Perception: { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 2 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      expect(useCharacterBurnerStatStore.getState().getStat("Perception").exponent).toBe(5);
    });

    it("does not apply Child Prodigy bonus when childProdigyStat is undefined", () => {
      setTraits(["Child Prodigy"]);

      expect(useCharacterBurnerStatStore.getState().getStat("Perception").exponent).toBe(0);
    });

    it("can apply both a Frail penalty and a Missing Hand penalty simultaneously if the stat is Agility and Frail-chosen", () => {
      setTraits(["Frail", "Missing Hand"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, frailStat: AbilityIds.Agility } });
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Agility: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 5 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      expect(useCharacterBurnerStatStore.getState().getStat("Agility").exponent).toBe(3);
    });
  });

  describe("shiftStatShade", () => {
    it("does not shift on when there isn't enough pool remaining (5) between own+either pools", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      useCharacterBurnerStatStore.getState().shiftStatShade("Power");

      // getAge() is 0 with no lifepaths -> getAgePool returns all-zero pools -> not enough remaining.
      expect(useCharacterBurnerStatStore.getState().stats.Power.shadeShifted).toBe(false);
    });

    it("shifts on and spends from main/either pools when there is enough pool remaining", () => {
      // Use the fixture's Born Dwarf lifepath directly via ruleset to get real pool numbers.
      const bornDwarf = useRulesetStore.getState().getLifepath(0 as dat.LifepathId);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerStatStore.getState().shiftStatShade("Power");

      const stat = useCharacterBurnerStatStore.getState().stats.Power;
      expect(stat.shadeShifted).toBe(true);
      expect(stat.mainPoolSpent.shade + stat.eitherPoolSpent.shade).toBe(-5);
    });

    it("shifts off and resets shade spending to zero", () => {
      useCharacterBurnerStatStore.setState({
        stats: {
          ...useCharacterBurnerStatStore.getState().stats,
          Power: { poolType: "Physical", shadeShifted: true, mainPoolSpent: { shade: -5, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
        }
      });

      useCharacterBurnerStatStore.getState().shiftStatShade("Power");

      const stat = useCharacterBurnerStatStore.getState().stats.Power;
      expect(stat.shadeShifted).toBe(false);
      expect(stat.mainPoolSpent.shade).toBe(0);
      expect(stat.eitherPoolSpent.shade).toBe(0);
    });
  });

  describe("modifyStatExponent", () => {
    it("increases the exponent from the stat's own pool when it has remaining and under the stock limit", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(0 as dat.LifepathId);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerStatStore.getState().modifyStatExponent("Power");

      expect(useCharacterBurnerStatStore.getState().stats.Power.mainPoolSpent.exponent).toBe(1);
    });

    it("does not increase past the stock limit", () => {
      useCharacterBurnerLimitsStore.setState({
        limits: { ...useCharacterBurnerLimitsStore.getState().limits, stats: { ...useCharacterBurnerLimitsStore.getState().limits.stats, Power: { min: 1, max: 1 } } }
      });
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 1 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      useCharacterBurnerStatStore.getState().modifyStatExponent("Power");

      expect(useCharacterBurnerStatStore.getState().stats.Power.mainPoolSpent.exponent).toBe(1);
    });

    it("increases from the either pool when the own pool is exhausted but either pool has remaining", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(0 as dat.LifepathId);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      // Born Dwarf's physical pool is the age-0 stock pool (14) + lifepath physicalStatPool (3) = 17;
      // exhaust it fully via mainPoolSpent so only the eitherPool (2) remains.
      useCharacterBurnerLimitsStore.setState({
        limits: { ...useCharacterBurnerLimitsStore.getState().limits, stats: { ...useCharacterBurnerLimitsStore.getState().limits.stats, Power: { min: 1, max: 99 } } }
      });
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 17 }, eitherPoolSpent: { shade: 0, exponent: 0 } } }
      });

      useCharacterBurnerStatStore.getState().modifyStatExponent("Power");

      expect(useCharacterBurnerStatStore.getState().stats.Power.eitherPoolSpent.exponent).toBe(1);
    });

    it("does not increase when neither own nor either pool has remaining", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      useCharacterBurnerStatStore.getState().modifyStatExponent("Power");

      expect(useCharacterBurnerStatStore.getState().stats.Power.mainPoolSpent.exponent).toBe(0);
      expect(useCharacterBurnerStatStore.getState().stats.Power.eitherPoolSpent.exponent).toBe(0);
    });

    it("decreases from the main pool first when it has spending", () => {
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 2 }, eitherPoolSpent: { shade: 0, exponent: 1 } } }
      });

      useCharacterBurnerStatStore.getState().modifyStatExponent("Power", true);

      expect(useCharacterBurnerStatStore.getState().stats.Power.mainPoolSpent.exponent).toBe(1);
      expect(useCharacterBurnerStatStore.getState().stats.Power.eitherPoolSpent.exponent).toBe(1);
    });

    it("decreases from the either pool when the main pool has no spending", () => {
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats, Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 1 } } }
      });

      useCharacterBurnerStatStore.getState().modifyStatExponent("Power", true);

      expect(useCharacterBurnerStatStore.getState().stats.Power.eitherPoolSpent.exponent).toBe(0);
    });

    it("no-ops decrease when neither pool has spending", () => {
      useCharacterBurnerStatStore.getState().modifyStatExponent("Power", true);

      expect(useCharacterBurnerStatStore.getState().stats.Power.mainPoolSpent.exponent).toBe(0);
      expect(useCharacterBurnerStatStore.getState().stats.Power.eitherPoolSpent.exponent).toBe(0);
    });
  });
});
