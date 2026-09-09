import { beforeEach, describe, expect, it } from "vitest";

import { LifepathIds, SeedRuleset, StockIds } from "./_fixtures/ruleset";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerSkillStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
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

describe("useCharacterBurnerLifepathStore", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerSkillStore.getState().reset();
    useCharacterBurnerAttributeStore.getState().reset();
    useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"], gender: "Male" });
  });

  describe("addLifepath / removeLastLifepath", () => {
    it("adds a lifepath and updates available lifepaths", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);

      useCharacterBurnerLifepathStore.getState().addLifepath(bornDwarf);

      expect(useCharacterBurnerLifepathStore.getState().lifepaths).toEqual([bornDwarf]);
    });

    it("removes the last lifepath added", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, miner] });

      useCharacterBurnerLifepathStore.getState().removeLastLifepath();

      expect(useCharacterBurnerLifepathStore.getState().lifepaths).toEqual([bornDwarf]);
    });

    it("removing from an empty lifepath list results in an empty list", () => {
      useCharacterBurnerLifepathStore.getState().removeLastLifepath();
      expect(useCharacterBurnerLifepathStore.getState().lifepaths).toEqual([]);
    });
  });

  describe("hasLifepath / hasLifepathByName", () => {
    it("counts occurrences by id", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf] });

      expect(useCharacterBurnerLifepathStore.getState().hasLifepath(LifepathIds.BornDwarf)).toBe(2);
    });

    it("counts occurrences by name", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      expect(useCharacterBurnerLifepathStore.getState().hasLifepathByName("Born Dwarf")).toBe(1);
      expect(useCharacterBurnerLifepathStore.getState().hasLifepathByName("Unknown")).toBe(0);
    });
  });

  describe("hasSetting / hasSettingByName", () => {
    it("counts lifepaths in a setting by id", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      expect(useCharacterBurnerLifepathStore.getState().hasSetting(bornDwarf.setting[0] as dat.SettingId)).toBe(1);
    });

    it("counts lifepaths in a setting by name", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      expect(useCharacterBurnerLifepathStore.getState().hasSettingByName("Homestead")).toBe(1);
      expect(useCharacterBurnerLifepathStore.getState().hasSettingByName("Unknown")).toBe(0);
    });
  });

  describe("getLeadCount", () => {
    it("returns 0 for an empty lifepath list", () => {
      expect(useCharacterBurnerLifepathStore.getState().getLeadCount()).toBe(0);
    });

    it("returns 0 when all lifepaths share the same setting", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf] });

      expect(useCharacterBurnerLifepathStore.getState().getLeadCount()).toBe(0);
    });

    it("counts a setting transition between adjacent lifepaths", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, miner] });

      expect(useCharacterBurnerLifepathStore.getState().getLeadCount()).toBe(1);
    });
  });

  describe("getAge", () => {
    it("returns 0 for an empty lifepath list", () => {
      expect(useCharacterBurnerLifepathStore.getState().getAge()).toBe(0);
    });

    it("sums fixed lifepath years plus lead count", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, miner] });

      // 16 + 5 + 1 lead = 22
      expect(useCharacterBurnerLifepathStore.getState().getAge()).toBe(22);
    });

    it("uses an explicitly passed lifepaths array over the stored one", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      expect(useCharacterBurnerLifepathStore.getState().getAge([bornDwarf])).toBe(16);
    });
  });

  describe("getMentalPool / getPhysicalPool / getEitherPool", () => {
    it("computes mental pool total from stock age pool + lifepath contributions", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      // age 16 -> Dwarf age-0 bracket mentalPool 7, + lifepath mentalStatPool 3 = 10
      expect(useCharacterBurnerLifepathStore.getState().getMentalPool().total).toBe(10);
    });

    it("computes physical pool total from stock age pool + lifepath contributions", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      // age 16 -> Dwarf age-0 bracket physicalPool 14, + lifepath physicalStatPool 3 = 17
      expect(useCharacterBurnerLifepathStore.getState().getPhysicalPool().total).toBe(17);
    });

    it("zeroes a lifepath's stat pool contribution entirely on the 3rd+ occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf, bornDwarf] });

      // age accumulates leads too, but since all share setting there's no lead bump; age = 48.
      // At age 48 both the minAge:0 and minAge:25 Dwarf brackets qualify (48 > 0 and 48 > 25);
      // getAgePool picks the more specific minAge:25 bracket (mentalPool 10). Only 1st/2nd
      // occurrences' mentalStatPool (3 each) count toward the lifepath pool, 3rd is zeroed:
      // 10 + 3 + 3 = 16.
      expect(useCharacterBurnerLifepathStore.getState().getMentalPool().total).toBe(16);
    });

    it("zeroes a lifepath's physical/either stat pool contribution entirely on the 3rd+ occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf, bornDwarf] });

      // Same LoDR rule as mental (see the test above): only 1st/2nd occurrences count.
      // physicalStatPool 3 each -> 18 (minAge:25 bracket, age 48) + 3 + 3 = 24.
      expect(useCharacterBurnerLifepathStore.getState().getPhysicalPool().total).toBe(24);
      // eitherStatPool 2 each -> 2 + 2 = 4 (no stock contribution to the either pool).
      expect(useCharacterBurnerLifepathStore.getState().getEitherPool().total).toBe(4);
    });

    it("treats a null mentalStatPool/physicalStatPool/eitherStatPool as contributing 0", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const noPools: Lifepath = { ...bornDwarf, pools: { ...bornDwarf.pools, mentalStatPool: null, physicalStatPool: null, eitherStatPool: null } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noPools] });

      // age-0 bracket only (7 mental / 14 physical), no lifepath contribution.
      expect(useCharacterBurnerLifepathStore.getState().getMentalPool().total).toBe(7);
      expect(useCharacterBurnerLifepathStore.getState().getPhysicalPool().total).toBe(14);
      expect(useCharacterBurnerLifepathStore.getState().getEitherPool().total).toBe(0);
    });

    it("shifts one point from physical to mental for Mind over Matter", () => {
      setTraits(["Mind over Matter"]);
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      expect(useCharacterBurnerLifepathStore.getState().getMentalPool().total).toBe(11);
      expect(useCharacterBurnerLifepathStore.getState().getPhysicalPool().total).toBe(16);
    });

    it("shifts one point from mental to physical for Robust", () => {
      setTraits(["Robust"]);
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      expect(useCharacterBurnerLifepathStore.getState().getMentalPool().total).toBe(9);
      expect(useCharacterBurnerLifepathStore.getState().getPhysicalPool().total).toBe(18);
    });

    it("computes spent/remaining from stats' mainPoolSpent for the relevant poolType", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });
      useCharacterBurnerStatStore.setState({
        stats: {
          ...useCharacterBurnerStatStore.getState().stats,
          Will: { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 4 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
        }
      });

      const pool = useCharacterBurnerLifepathStore.getState().getMentalPool();
      expect(pool.spent).toBe(4);
      expect(pool.remaining).toBe(6);
    });

    it("computes the either pool total/spent from eitherStatPool and eitherPoolSpent", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });
      useCharacterBurnerStatStore.setState({
        stats: {
          ...useCharacterBurnerStatStore.getState().stats,
          Will: { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 1 } }
        }
      });

      const pool = useCharacterBurnerLifepathStore.getState().getEitherPool();
      expect(pool.total).toBe(2);
      expect(pool.spent).toBe(1);
      expect(pool.remaining).toBe(1);
    });

    it("uses an explicitly passed lifepaths array for the lifepath-pool portion, but the stock age", () => {
      // NOTE: getAgePool() (called internally for the stock/age-bracket portion of the pool) reads
      // getAge() with NO override, which always uses the STORED lifepaths -- so passing an explicit
      // lifepaths array to getMentalPool only affects the lifepath-contributed portion of the total,
      // not the stock age-bracket portion. With stored lifepaths empty, age is 0 so the stock
      // contribution is 0, even though the passed-in array's own mentalStatPool (3) still applies.
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      expect(useCharacterBurnerLifepathStore.getState().getMentalPool([bornDwarf]).total).toBe(3);
    });
  });

  describe("updateAvailableLifepaths", () => {
    it("wires the correct args to FilterLifepaths, returning born lifepaths for an empty history", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      const result = useCharacterBurnerLifepathStore.getState().updateAvailableLifepaths();

      expect(result.map(l => l.id)).toEqual([LifepathIds.BornDwarf]);
      expect(useCharacterBurnerLifepathStore.getState().availableLifepaths).toEqual(result);
    });

    it("returns leads-derived lifepaths for a non-empty history", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      const result = useCharacterBurnerLifepathStore.getState().updateAvailableLifepaths();

      expect(result.map(l => l.id)).toEqual([LifepathIds.Miner]);
    });
  });
});
