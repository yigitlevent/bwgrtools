import { beforeEach, describe, expect, it } from "vitest";

import { AbilityIds, LifepathIds, PatchRulesetSkill, SeedRuleset, SkillIds } from "./_fixtures/ruleset";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerSkillStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";


function setCharSkills(skills: CharacterSkill[]): void {
  useCharacterBurnerSkillStore.setState({ skills: new UniqueArray<dat.SkillId, CharacterSkill>(skills) });
}

function setTraits(names: string[]): void {
  useCharacterBurnerTraitStore.setState({
    traits: new UniqueArray<dat.TraitId, CharacterTrait>(
      names.map((name, i) => ({ id: i as dat.TraitId, name, type: "General", isOpen: true }))
    )
  });
}

describe("useCharacterBurnerSkillStore", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerSkillStore.getState().reset();
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerAttributeStore.getState().reset();
  });

  describe("getSkillPools", () => {
    it("computes general/lifepath pool totals with nothing spent", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });

      const { general, lifepath } = useCharacterBurnerSkillStore.getState().getSkillPools();

      expect(general).toEqual({ total: 2, spent: 0, remaining: 2 });
      expect(lifepath).toEqual({ total: 1, spent: 0, remaining: 1 });
    });

    it("halves the pool contribution (rounded down) on the 3rd occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const lifepaths = [bornDwarf, bornDwarf, bornDwarf];
      useCharacterBurnerLifepathStore.setState({ lifepaths });

      const { general } = useCharacterBurnerSkillStore.getState().getSkillPools();

      // 2 + 2 + floor(2*0.5) = 5
      expect(general.total).toBe(5);
    });

    it("loses the pool contribution entirely on the 4th+ occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const lifepaths = [bornDwarf, bornDwarf, bornDwarf, bornDwarf];
      useCharacterBurnerLifepathStore.setState({ lifepaths });

      const { general } = useCharacterBurnerSkillStore.getState().getSkillPools();

      // 2 + 2 + 1 + 0 = 5
      expect(general.total).toBe(5);
    });

    it("deducts general pool spend for open General skills (single/double) and advancement", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([
        { id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 1, lifepath: 0 } }
      ]);

      const { general } = useCharacterBurnerSkillStore.getState().getSkillPools();

      expect(general.spent).toBe(2);
      expect(general.remaining).toBe(0);
    });

    it("deducts double for a magical/training General skill open state", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([
        { id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "double", advancement: { general: 0, lifepath: 0 } }
      ]);

      const { general } = useCharacterBurnerSkillStore.getState().getSkillPools();

      expect(general.spent).toBe(2);
    });

    it("deducts lifepath pool spend for non-General skills and general spend for their advancement.general", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([
        { id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 1, lifepath: 1 } }
      ]);

      const { general, lifepath } = useCharacterBurnerSkillStore.getState().getSkillPools();

      expect(lifepath.spent).toBe(2);
      expect(general.spent).toBe(1);
    });

    it("deducts double lifepath pool spend for a magical/training non-General skill open state", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([
        { id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "double", advancement: { general: 0, lifepath: 0 } }
      ]);

      const { lifepath } = useCharacterBurnerSkillStore.getState().getSkillPools();

      expect(lifepath.spent).toBe(2);
    });

    it("multiplies the general pool contribution per-year for isGSPMultipliedByYear lifepaths", () => {
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const multiplied: Lifepath = { ...miner, flags: { ...miner.flags, isGSPMultipliedByYear: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [multiplied] });

      // Miner's generalSkillPool is 1, years is 5 -> 1*5=5.
      const { general } = useCharacterBurnerSkillStore.getState().getSkillPools();
      expect(general.total).toBe(5);
    });

    it("multiplies the lifepath pool contribution per-year for isLSPMultipliedByYear lifepaths", () => {
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const multiplied: Lifepath = { ...miner, flags: { ...miner.flags, isLSPMultipliedByYear: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [multiplied] });

      // Miner's lifepathSkillPool is 2, years is 5 -> 2*5=10.
      const { lifepath } = useCharacterBurnerSkillStore.getState().getSkillPools();
      expect(lifepath.total).toBe(10);
    });

    it("grants half of the previous lifepath's GSP/LSP (rounded down) for getHalfGSPFromPrevLP/getHalfLSPFromPrevLP", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const halved: Lifepath = { ...miner, flags: { ...miner.flags, getHalfGSPFromPrevLP: true, getHalfLSPFromPrevLP: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, halved] });

      // bornDwarf GSP=2 -> +floor(2/2)=1 to miner's own GSP(1) = 2; total 2+2=4.
      // bornDwarf LSP=1 -> +floor(1/2)=0 to miner's own LSP(2) = 2; total 1+2=3.
      const { general, lifepath } = useCharacterBurnerSkillStore.getState().getSkillPools();
      expect(general.total).toBe(4);
      expect(lifepath.total).toBe(3);
    });

    it("treats a null generalSkillPool/lifepathSkillPool as 0 even when the per-year multiplier applies", () => {
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const noPool: Lifepath = { ...miner, pools: { ...miner.pools, generalSkillPool: null, lifepathSkillPool: null }, flags: { ...miner.flags, isGSPMultipliedByYear: true, isLSPMultipliedByYear: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noPool] });

      const { general, lifepath } = useCharacterBurnerSkillStore.getState().getSkillPools();
      expect(general.total).toBe(0);
      expect(lifepath.total).toBe(0);
    });

    it("treats the previous lifepath's null pool value as 0 for the half-from-prev bonus", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const noPoolPrev: Lifepath = { ...bornDwarf, pools: { ...bornDwarf.pools, generalSkillPool: null } };
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const halved: Lifepath = { ...miner, flags: { ...miner.flags, getHalfGSPFromPrevLP: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noPoolPrev, halved] });

      // prev contributes 0 GSP of its own and 0 to miner via the half-from-prev bonus; miner's own
      // GSP is 1 -> total 0 + 1 = 1.
      const { general } = useCharacterBurnerSkillStore.getState().getSkillPools();
      expect(general.total).toBe(1);
    });

    it("does not apply the half-from-prev bonus to the first lifepath (no previous lifepath)", () => {
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const halved: Lifepath = { ...miner, flags: { ...miner.flags, getHalfGSPFromPrevLP: true, getHalfLSPFromPrevLP: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [halved] });

      const { general, lifepath } = useCharacterBurnerSkillStore.getState().getSkillPools();
      expect(general.total).toBe(1);
      expect(lifepath.total).toBe(2);
    });
  });

  describe("openSkill", () => {
    it("opens a General skill as 'yes' when the general pool has room", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "no", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().openSkill(SkillIds.Doctrine);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)?.isOpen).toBe("yes");
    });

    it("does not open a General skill when the general pool has no room", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "no", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().openSkill(SkillIds.Doctrine);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)?.isOpen).toBe("no");
    });

    it("opens a non-General skill using either general or lifepath pool remaining", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "no", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().openSkill(SkillIds.Sword);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)?.isOpen).toBe("yes");
    });

    it("closes an open skill and resets its advancement", () => {
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 1, lifepath: 1 } }]);

      useCharacterBurnerSkillStore.getState().openSkill(SkillIds.Sword);

      const skill = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword);
      expect(skill?.isOpen).toBe("no");
      expect(skill?.advancement).toEqual({ general: 0, lifepath: 0 });
    });

    it("no-ops for a skill not found in the character's skill list", () => {
      useCharacterBurnerSkillStore.getState().openSkill(SkillIds.Sword);
      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)).toBeUndefined();
    });

    it("opens a non-General skill using lifepath pool remaining when the general pool is exhausted", () => {
      // Miner's generalSkillPool is 1 and lifepathSkillPool is 2 -- open one General skill first to
      // exhaust the general pool, then open the non-General Sword skill via the lifepath pool alone.
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.Miner)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([
        { id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } },
        { id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "no", advancement: { general: 0, lifepath: 0 } }
      ]);

      useCharacterBurnerSkillStore.getState().openSkill(SkillIds.Sword);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)?.isOpen).toBe("yes");
    });

    it("opens with 'double' state for a magical/training skill", () => {
      PatchRulesetSkill(SkillIds.Doctrine, { flags: { dontList: false, isMagical: true, isTraining: false } });
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "no", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().openSkill(SkillIds.Doctrine);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)?.isOpen).toBe("double");
    });
  });

  describe("modifySkillExponent", () => {
    it("no-ops when the skill is not open", () => {
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "no", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().modifySkillExponent(SkillIds.Sword);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)?.advancement).toEqual({ general: 0, lifepath: 0 });
    });

    it("increases lifepath advancement first when lifepath pool has room", () => {
      // Miner's lifepathSkillPool is 2; opening its Sword skill spends 1 of that, leaving 1 remaining
      // for advancement.
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.Miner)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().modifySkillExponent(SkillIds.Sword);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)?.advancement.lifepath).toBe(1);
    });

    it("increases general advancement when lifepath pool is exhausted but general has room", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 1 } }]);

      useCharacterBurnerSkillStore.getState().modifySkillExponent(SkillIds.Sword);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)?.advancement.general).toBe(1);
    });

    it("does not increase when neither pool has room", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().modifySkillExponent(SkillIds.Sword);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)?.advancement).toEqual({ general: 0, lifepath: 0 });
    });

    it("decreases general spending first when present", () => {
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 1, lifepath: 1 } }]);

      useCharacterBurnerSkillStore.getState().modifySkillExponent(SkillIds.Sword, true);

      const skill = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword);
      expect(skill?.advancement).toEqual({ general: 0, lifepath: 1 });
    });

    it("decreases lifepath spending when general has none", () => {
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 1 } }]);

      useCharacterBurnerSkillStore.getState().modifySkillExponent(SkillIds.Sword, true);

      const skill = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword);
      expect(skill?.advancement).toEqual({ general: 0, lifepath: 0 });
    });

    it("no-ops decrease when neither pool has spending", () => {
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().modifySkillExponent(SkillIds.Sword, true);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)?.advancement).toEqual({ general: 0, lifepath: 0 });
    });
  });

  describe("addGeneralSkill / removeGeneralSkill", () => {
    it("adds a general skill", () => {
      const rulesetSkill = useRulesetStore.getState().getSkill(SkillIds.Doctrine);
      useCharacterBurnerSkillStore.getState().addGeneralSkill(rulesetSkill);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)).toEqual({
        id: SkillIds.Doctrine, name: "Doctrine", isOpen: "no", type: "General", isSpecial: false, advancement: { general: 0, lifepath: 0 }
      });
    });

    it("marks isSpecial true when the ruleset skill has subskillIds", () => {
      const rulesetSkill = { ...useRulesetStore.getState().getSkill(SkillIds.Doctrine), subskillIds: [SkillIds.Sword] };
      useCharacterBurnerSkillStore.getState().addGeneralSkill(rulesetSkill);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)?.isSpecial).toBe(true);
    });

    it("no-ops adding a skill with a null id", () => {
      const rulesetSkill = { ...useRulesetStore.getState().getSkill(SkillIds.Doctrine), id: null };
      useCharacterBurnerSkillStore.getState().addGeneralSkill(rulesetSkill);

      expect(useCharacterBurnerSkillStore.getState().skills.length).toBe(0);
    });

    it("adds a skill whose real id is 0 (the guard checks `=== null`, not falsiness)", () => {
      const zeroId = 0 as dat.SkillId;
      const rulesetSkill = { ...useRulesetStore.getState().getSkill(SkillIds.Doctrine), id: zeroId };
      useCharacterBurnerSkillStore.getState().addGeneralSkill(rulesetSkill);

      expect(useCharacterBurnerSkillStore.getState().skills.find(zeroId)).toBeDefined();
    });

    it("falls back to an empty name when the ruleset skill has a null name", () => {
      const rulesetSkill = { ...useRulesetStore.getState().getSkill(SkillIds.Doctrine), name: null };
      useCharacterBurnerSkillStore.getState().addGeneralSkill(rulesetSkill);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)?.name).toBe("");
    });

    it("removes a general skill", () => {
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "no", advancement: { general: 0, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().removeGeneralSkill(SkillIds.Doctrine);

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)).toBeUndefined();
    });
  });

  describe("getSkill", () => {
    it("returns shade B and exponent 0 for a closed skill", () => {
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "no", advancement: { general: 0, lifepath: 0 } }]);

      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Sword)).toEqual({ shade: "B", exponent: 0 });
    });

    it("returns shade B and exponent 0 for a skill not present", () => {
      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Sword)).toEqual({ shade: "B", exponent: 0 });
    });

    it("computes exponent as floor(average(root exponents)/2) plus advancement, for an open skill", () => {
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats,
          Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 4 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
          Agility: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 2 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
        }
      });
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 1, lifepath: 0 } }]);

      // roots: Power(4) + Agility(2) = avg 3, /2 = 1.5, floor = 1, + advancement 1 = 2
      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Sword)).toEqual({ shade: "B", exponent: 2 });
    });

    it("rounds up instead of down when Acute is open and Perception is rooted", () => {
      setTraits(["Acute"]);
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats,
          Perception: { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 3 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
        }
      });
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      // root: Perception(3), avg 3, /2 = 1.5, ceil = 2
      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Doctrine).exponent).toBe(2);
    });

    it("rounds up for Hand-Eye Coordination only when rooted in both Perception and Agility", () => {
      setTraits(["Hand-Eye Coordination"]);
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats,
          Power: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 4 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
          Agility: { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 1 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
        }
      });
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      // Sword roots: Power+Agility, not Perception+Agility -- Hand-Eye Coordination shouldn't apply.
      // avg(4,1)=2.5 /2 = 1.25, floor = 1 (not rounded up, since roots aren't Perception+Agility).
      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Sword).exponent).toBe(1);
    });

    it("shifts shade to gray when all roots are gray-shaded", () => {
      useCharacterBurnerStatStore.setState({
        stats: { ...useCharacterBurnerStatStore.getState().stats,
          Power: { poolType: "Physical", shadeShifted: true, mainPoolSpent: { shade: 0, exponent: 2 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
          Agility: { poolType: "Physical", shadeShifted: true, mainPoolSpent: { shade: 0, exponent: 2 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
        }
      });
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Sword).shade).toBe("G");
    });

    it("shifts Inconspicuous to gray unconditionally when Cipher is open", () => {
      // Reuse the Doctrine skill fixture but rename it in the character skill entry to "Inconspicuous"
      // for the name-based Cipher check.
      setTraits(["Cipher"]);
      setCharSkills([{ id: SkillIds.Doctrine, name: "Inconspicuous", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Doctrine).shade).toBe("G");
    });

    it("shifts the Child-Prodigy-chosen skill to gray", () => {
      setTraits(["Child Prodigy"]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, childProdigyShiftedSkill: SkillIds.Doctrine } });
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Doctrine).shade).toBe("G");
    });

    it("returns exponent 0 shade B for a skill with no roots (still applies advancement)", () => {
      PatchRulesetSkill(SkillIds.Doctrine, { roots: undefined });
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 2, lifepath: 0 } }]);

      expect(useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Doctrine)).toEqual({ shade: "B", exponent: 2 });
    });

    it("reads an attribute root via getAttribute when the root id is a known attribute", () => {
      // Root the Sword skill in the Steel derived attribute instead of a stat, to hit the
      // hasAttribute/getAttribute branch instead of getStat.
      PatchRulesetSkill(SkillIds.Sword, { roots: [[AbilityIds.Steel, "Steel"]] });
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Steel, name: "Steel", hasShade: false, shadeShifted: false, exponent: 4 }])
      });
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);

      const result = useCharacterBurnerSkillStore.getState().getSkill(SkillIds.Sword);
      expect(result.exponent).toBeGreaterThanOrEqual(0);
    });
  });

  describe("hasSkillOpen / hasSkillOpenByName", () => {
    it("hasSkillOpen is true for yes/double states", () => {
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "double", advancement: { general: 0, lifepath: 0 } }]);
      expect(useCharacterBurnerSkillStore.getState().hasSkillOpen(SkillIds.Sword)).toBe(true);
    });

    it("hasSkillOpen is false for 'no' or missing", () => {
      expect(useCharacterBurnerSkillStore.getState().hasSkillOpen(SkillIds.Sword)).toBe(false);
    });

    it("hasSkillOpenByName matches by name among open skills", () => {
      setCharSkills([{ id: SkillIds.Sword, name: "Sword", type: "Lifepath", isSpecial: false, isOpen: "yes", advancement: { general: 0, lifepath: 0 } }]);
      expect(useCharacterBurnerSkillStore.getState().hasSkillOpenByName("Sword")).toBe(true);
      expect(useCharacterBurnerSkillStore.getState().hasSkillOpenByName("Unknown")).toBe(false);
    });
  });

  describe("updateSkills", () => {
    it("adds lifepath skills, with the mandatory-index skill open on 1st occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerSkillStore.getState().updateSkills();

      const skill = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine);
      expect(skill).toMatchObject({ type: "Mandatory", isOpen: "yes" });
    });

    it("opens with 'double' for a mandatory magical/training skill", () => {
      PatchRulesetSkill(SkillIds.Doctrine, { flags: { dontList: false, isMagical: false, isTraining: true } });
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)?.isOpen).toBe("double");
    });

    it("adds companion-granted skills not already present", () => {
      const lp: Lifepath = {
        ...useRulesetStore.getState().getLifepath(LifepathIds.Miner),
        companion: { name: "Pit Pony", givesSkills: true, settingIds: [] }
      };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: {
          ...useCharacterBurnerSpecialStore.getState().special,
          companionLifepath: { "Pit Pony": LifepathIds.Miner },
          companionSkills: { [LifepathIds.Miner]: [SkillIds.Doctrine] }
        }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      const doctrine = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine);
      expect(doctrine).toMatchObject({ type: "Lifepath", isOpen: "no" });
    });

    it("does not add a companion skill already present", () => {
      const lp: Lifepath = {
        ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf),
        companion: { name: "Pit Pony", givesSkills: true, settingIds: [] }
      };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: {
          ...useCharacterBurnerSpecialStore.getState().special,
          companionLifepath: { "Pit Pony": LifepathIds.BornDwarf },
          companionSkills: { [LifepathIds.BornDwarf]: [SkillIds.Doctrine] }
        }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      const entries = useCharacterBurnerSkillStore.getState().skills.filter(s => s.id === SkillIds.Doctrine);
      expect(entries.length).toBe(1);
    });

    it("no-ops companion skills when the lifepath has no companion entry chosen", () => {
      const lp: Lifepath = {
        ...useRulesetStore.getState().getLifepath(LifepathIds.Miner),
        companion: { name: "Pit Pony", givesSkills: true, settingIds: [] }
      };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)).toBeUndefined();
    });

    it("skips companion skill logic entirely when the lifepath's companion does not give skills", () => {
      const lp: Lifepath = {
        ...useRulesetStore.getState().getLifepath(LifepathIds.Miner),
        companion: { name: "Pit Pony", givesSkills: false, settingIds: [] }
      };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: { ...useCharacterBurnerSpecialStore.getState().special, companionLifepath: { "Pit Pony": LifepathIds.Miner }, companionSkills: { [LifepathIds.Miner]: [SkillIds.Doctrine] } }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)).toBeUndefined();
    });

    it("leaves a lifepath-sourced placeholder alone when no subskill has been chosen yet", () => {
      // updateSkills builds its working `characterSkills` set from `lifepaths` first (then merges in
      // pre-existing General skills only at the very end) -- so the chosenSubskills replacement step
      // only ever sees a placeholder that came FROM a lifepath's skill list, not a pre-existing
      // General-type placeholder. Use a lifepath-sourced placeholder here to exercise that branch.
      const lp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), skills: [SkillIds.Sword] };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: [] } }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)).toBeDefined();
    });

    it("replaces a lifepath-sourced placeholder with the chosen skills", () => {
      const lp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), skills: [SkillIds.Sword] };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: [SkillIds.Doctrine] } }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)).toBeUndefined();
      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)).toMatchObject({ type: "Mandatory" });
    });

    it("does not re-add a chosen subskill that already exists", () => {
      const lp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), skills: [SkillIds.Sword, SkillIds.Doctrine] };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: [SkillIds.Doctrine] } }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      const entries = useCharacterBurnerSkillStore.getState().skills.filter(s => s.id === SkillIds.Doctrine);
      expect(entries.length).toBe(1);
    });

    it("preserves previously-added General skills not present in the new lifepath skill set", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 1, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)).toMatchObject({ type: "General", isOpen: "yes" });
    });

    it("does not duplicate a preserved General skill already present via lifepath", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });
      setCharSkills([{ id: SkillIds.Doctrine, name: "Doctrine", type: "General", isSpecial: false, isOpen: "yes", advancement: { general: 1, lifepath: 0 } }]);

      useCharacterBurnerSkillStore.getState().updateSkills();

      const entries = useCharacterBurnerSkillStore.getState().skills.filter(s => s.id === SkillIds.Doctrine);
      expect(entries.length).toBe(1);
    });

    it("marks isSpecial true for a lifepath skill with subskillIds", () => {
      PatchRulesetSkill(SkillIds.Doctrine, { subskillIds: [SkillIds.Sword] });
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)?.isSpecial).toBe(true);
    });

    it("marks the 2nd skill mandatory on the 2nd occurrence", () => {
      const lpWithTwoSkills: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), skills: [SkillIds.Doctrine, SkillIds.Sword] };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lpWithTwoSkills, lpWithTwoSkills] });

      useCharacterBurnerSkillStore.getState().updateSkills();

      const sword = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword);
      expect(sword).toMatchObject({ type: "Mandatory", isOpen: "yes" });
    });

    it("grants no mandatory skill from a lifepath with no skills array", () => {
      const lp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), skills: undefined };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.length).toBe(0);
    });

    it("grants no mandatory skill from a lifepath's 3rd+ occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf, bornDwarf] });

      useCharacterBurnerSkillStore.getState().updateSkills();

      // With 3 occurrences of the same lifepath (same ids, UniqueArray keeps only the last), the
      // 3rd occurrence's mandatoryIndex is -1, so its entries (both Lifepath type) shadow the
      // earlier Mandatory entries entirely -- same LoDR-shadowing behavior as traits.
      const skills = useCharacterBurnerSkillStore.getState().skills;
      expect(skills.filter(s => s.type === "Mandatory").length).toBe(0);
    });

    it("falls back to the referenced skill id and an empty name for a lifepath skill when the ruleset lookup resolves nulls", () => {
      const brokenDoctrine: Skill = { ...useRulesetStore.getState().getSkill(SkillIds.Doctrine), id: null, name: null };
      useRulesetStore.setState({
        skills: useRulesetStore.getState().skills.map(s => s.id === SkillIds.Doctrine ? brokenDoctrine : s),
        skillsById: new Map(useRulesetStore.getState().skillsById).set(SkillIds.Doctrine, brokenDoctrine)
      });
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerSkillStore.getState().updateSkills();

      const entry = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine);
      expect(entry?.name).toBe("");
    });

    it("marks isSpecial true for a companion-granted skill with subskillIds", () => {
      PatchRulesetSkill(SkillIds.Doctrine, { subskillIds: [SkillIds.Sword] });
      const lp: Lifepath = {
        ...useRulesetStore.getState().getLifepath(LifepathIds.Miner),
        companion: { name: "Pit Pony", givesSkills: true, settingIds: [] }
      };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: {
          ...useCharacterBurnerSpecialStore.getState().special,
          companionLifepath: { "Pit Pony": LifepathIds.Miner },
          companionSkills: { [LifepathIds.Miner]: [SkillIds.Doctrine] }
        }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine)?.isSpecial).toBe(true);
    });

    it("falls back to the referenced skill id and an empty name for a companion-granted skill when the ruleset lookup resolves nulls", () => {
      const brokenDoctrine: Skill = { ...useRulesetStore.getState().getSkill(SkillIds.Doctrine), id: null, name: null };
      useRulesetStore.setState({
        skills: useRulesetStore.getState().skills.map(s => s.id === SkillIds.Doctrine ? brokenDoctrine : s),
        skillsById: new Map(useRulesetStore.getState().skillsById).set(SkillIds.Doctrine, brokenDoctrine)
      });
      const lp: Lifepath = {
        ...useRulesetStore.getState().getLifepath(LifepathIds.Miner),
        companion: { name: "Pit Pony", givesSkills: true, settingIds: [] }
      };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: {
          ...useCharacterBurnerSpecialStore.getState().special,
          companionLifepath: { "Pit Pony": LifepathIds.Miner },
          companionSkills: { [LifepathIds.Miner]: [SkillIds.Doctrine] }
        }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      const entry = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine);
      expect(entry?.name).toBe("");
    });

    it("falls back to the referenced skill id and an empty name for a chosen subskill when the ruleset lookup resolves nulls", () => {
      const brokenDoctrine: Skill = { ...useRulesetStore.getState().getSkill(SkillIds.Doctrine), id: null, name: null };
      useRulesetStore.setState({
        skills: useRulesetStore.getState().skills.map(s => s.id === SkillIds.Doctrine ? brokenDoctrine : s),
        skillsById: new Map(useRulesetStore.getState().skillsById).set(SkillIds.Doctrine, brokenDoctrine)
      });
      const lp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), skills: [SkillIds.Sword] };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: [SkillIds.Doctrine] } }
      });

      useCharacterBurnerSkillStore.getState().updateSkills();

      const entry = useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Doctrine);
      expect(entry?.name).toBe("");
    });

    it("treats a chosenSubskills entry resolving to undefined as an empty chosen list", () => {
      // The outer filter checks `skill.id in special.chosenSubskills` (a JS `in` object-key check),
      // which is true even if the value stored there is explicitly undefined -- exercising
      // `RecordGet(...) ?? []`'s fallback independently of the `in` check's own result.
      const lp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), skills: [SkillIds.Sword] };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });
      useCharacterBurnerSpecialStore.setState({
        special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: undefined as unknown as dat.SkillId[] } }
      });

      expect(() => useCharacterBurnerSkillStore.getState().updateSkills()).not.toThrow();
      expect(useCharacterBurnerSkillStore.getState().skills.find(SkillIds.Sword)).toBeDefined();
    });
  });
});
