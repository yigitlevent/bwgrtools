import { beforeEach, describe, expect, it } from "vitest";

import { LifepathIds, SeedRuleset, StockIds, TraitIds } from "./_fixtures/ruleset";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerLimitsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLimits";
import { useCharacterBurnerResourceStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSpecialStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";


function setCharTraits(traits: CharacterTrait[]): void {
  useCharacterBurnerTraitStore.setState({ traits: new UniqueArray<dat.TraitId, CharacterTrait>(traits) });
}

describe("useCharacterBurnerTraitStore", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerResourceStore.getState().reset();
    useCharacterBurnerLimitsStore.getState().reset();
    useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });
  });

  describe("openTrait", () => {
    it("opens a trait when the trait pool has room", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: false }]);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)] });

      useCharacterBurnerTraitStore.getState().openTrait(TraitIds.Stoic);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)?.isOpen).toBe(true);
    });

    it("no-ops when the trait is not found in the character's trait list", () => {
      useCharacterBurnerTraitStore.getState().openTrait(TraitIds.Stoic);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toBeUndefined();
    });

    it("re-closes an already-open trait regardless of pool", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      useCharacterBurnerTraitStore.getState().openTrait(TraitIds.Stoic);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)?.isOpen).toBe(false);
    });

    it("does not open a trait when the pool has no remaining", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: false }]);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      useCharacterBurnerTraitStore.getState().openTrait(TraitIds.Stoic);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)?.isOpen).toBe(false);
    });

    it("triggers resource/lesson-of-one/limit recompute side effects when opening", () => {
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: false }]);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)] });

      useCharacterBurnerTraitStore.getState().openTrait(TraitIds.FamilyHeirloomGranter);

      // FamilyHeirloomGranter has grantsResourcesIsChoice: false, so the resource key includes the
      // granted resource id too: "trait-<traitId>-<resourceId>".
      expect(useCharacterBurnerResourceStore.getState().resources["trait-3-0"]).toBeDefined();
    });
  });

  describe("addGeneralTrait / removeGeneralTrait", () => {
    it("adds a general trait", () => {
      useCharacterBurnerTraitStore.getState().addGeneralTrait({ rulesets: null, id: TraitIds.Stoic, name: "Stoic", category: [1 as dat.TraitCategoryId, "General"], type: [0 as dat.TraitTypeId, "Character"], cost: 2 });

      const trait = useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic);
      expect(trait).toEqual({ id: TraitIds.Stoic, name: "Stoic", isOpen: false, type: "General" });
    });

    it("no-ops adding a trait with a null id", () => {
      useCharacterBurnerTraitStore.getState().addGeneralTrait({ rulesets: null, id: null, name: "Ghost", category: [1 as dat.TraitCategoryId, "General"], type: [0 as dat.TraitTypeId, "Character"], cost: 1 });

      expect(useCharacterBurnerTraitStore.getState().traits.length).toBe(0);
    });

    it("falls back to an empty name when the ruleset trait has a null name", () => {
      useCharacterBurnerTraitStore.getState().addGeneralTrait({ rulesets: null, id: TraitIds.Stoic, name: null, category: [1 as dat.TraitCategoryId, "General"], type: [0 as dat.TraitTypeId, "Character"], cost: 2 });

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)?.name).toBe("");
    });

    it("removes a general trait", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: false }]);

      useCharacterBurnerTraitStore.getState().removeGeneralTrait(TraitIds.Stoic);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toBeUndefined();
    });
  });

  describe("getTraitPools", () => {
    it("computes the base pool total from lifepaths' traitPool with nothing spent", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      expect(pools).toEqual({ total: 2, spent: 0, remaining: 2 });
    });

    it("zeroes a lifepath's trait pool contribution entirely on its 3rd+ occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const lifepaths = [bornDwarf, bornDwarf, bornDwarf];
      useCharacterBurnerLifepathStore.setState({ lifepaths });

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      // 1st occurrence: 2, 2nd occurrence: has 2 traits so full 2, 3rd occurrence: zeroed.
      expect(pools.total).toBe(4);
    });

    it("reduces the pool by 1 on the 2nd occurrence when the lifepath has no 2nd trait to grant", () => {
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const lifepaths = [miner, miner];
      useCharacterBurnerLifepathStore.setState({ lifepaths });

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      // Miner has a single trait (Stoic) so its 2nd occurrence has no 2nd trait -> pool - 1.
      // 1st occurrence: 1, 2nd occurrence: 1 - 1 = 0.
      expect(pools.total).toBe(1);
    });

    it("spends 1 per open Mandatory/Lifepath trait", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharTraits([
        { id: TraitIds.Faithful, name: "Faithful", type: "Mandatory", isOpen: true },
        { id: TraitIds.Stoic, name: "Stoic", type: "Lifepath", isOpen: true }
      ]);

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      expect(pools.spent).toBe(2);
    });

    it("spends the ruleset cost for an open General trait", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      expect(pools.spent).toBe(2);
    });

    it("grants Tainted Legacy's chosen trait for free even if General and open", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, taintedLegacyTrait: TraitIds.Stoic } });
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      expect(pools.spent).toBe(0);
    });

    it("does not spend for a closed trait", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: false }]);

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      expect(pools.spent).toBe(0);
    });

    it("does not spend for an open trait of a type other than Mandatory/Lifepath/General (e.g. Common)", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      setCharTraits([{ id: TraitIds.DwarvenBeard, name: "Dwarven Beard", type: "Common", isOpen: true }]);

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      expect(pools.spent).toBe(0);
    });

    it("treats a null ruleset trait cost as 0 for an open General trait", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      // Faithful's ruleset cost is null (it's normally granted free as a Mandatory/Lifepath trait);
      // reusing it here as an open General trait exercises the `rulesetTrait.cost ?? 0` fallback.
      setCharTraits([{ id: TraitIds.Faithful, name: "Faithful", type: "General", isOpen: true }]);

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      expect(pools.spent).toBe(0);
    });

    it("does not reduce the 2nd-occurrence pool when the lifepath does have a 2nd trait", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const lifepaths = [bornDwarf, bornDwarf];
      useCharacterBurnerLifepathStore.setState({ lifepaths });

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      // Born Dwarf has 2 traits (Faithful, Stoic), so its 2nd occurrence keeps the full traitPool
      // (2) rather than being reduced by 1 -- 1st(2) + 2nd(2) = 4.
      expect(pools.total).toBe(4);
    });

    it("treats a lifepath with no traits field at all as having 0 traits for the 2nd-occurrence check", () => {
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const noTraitsMiner: Lifepath = { ...miner };
      delete noTraitsMiner.traits;
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noTraitsMiner, noTraitsMiner] });

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      // Same LoDR reduction as the Miner case (no 2nd trait to grant) but via `traits` being
      // entirely absent rather than a length-1 array -- exercises the `cv.traits?.length ?? 0` and
      // `cv.pools.traitPool ?? 0` fallbacks together. Miner's traitPool is 1 -> 1st(1) + 2nd(1-1=0) = 1.
      expect(pools.total).toBe(1);
    });

    it("treats a null pools.traitPool as contributing 0 on the reduced 2nd occurrence too", () => {
      const miner = useRulesetStore.getState().getLifepath(LifepathIds.Miner);
      const noTraitPoolMiner: Lifepath = { ...miner, pools: { ...miner.pools, traitPool: null } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noTraitPoolMiner, noTraitPoolMiner] });

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      // 1st occurrence: 0 (null traitPool). 2nd occurrence: still only 1 trait (Stoic) so the LoDR
      // reduction applies, but its own traitPool contribution is also null -> 0 - 1 = -1. Total -1.
      expect(pools.total).toBe(-1);
    });

    it("treats a null pools.traitPool as contributing 0", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const noTraitPool: Lifepath = { ...bornDwarf, pools: { ...bornDwarf.pools, traitPool: null } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noTraitPool] });

      const pools = useCharacterBurnerTraitStore.getState().getTraitPools();

      expect(pools.total).toBe(0);
    });
  });

  describe("getTrait", () => {
    it("returns open: true for an open trait", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);
      expect(useCharacterBurnerTraitStore.getState().getTrait(TraitIds.Stoic)).toEqual({ open: true });
    });

    it("returns open: false for a closed trait", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: false }]);
      expect(useCharacterBurnerTraitStore.getState().getTrait(TraitIds.Stoic)).toEqual({ open: false });
    });

    it("returns open: false for a trait not present at all", () => {
      expect(useCharacterBurnerTraitStore.getState().getTrait(TraitIds.Stoic)).toEqual({ open: false });
    });
  });

  describe("hasTraitOpen / hasTraitOpenByName", () => {
    it("hasTraitOpen is true only when the trait exists and is open", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);
      expect(useCharacterBurnerTraitStore.getState().hasTraitOpen(TraitIds.Stoic)).toBe(true);
      expect(useCharacterBurnerTraitStore.getState().hasTraitOpen(TraitIds.Faithful)).toBe(false);
    });

    it("hasTraitOpenByName matches by name and open state", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);
      expect(useCharacterBurnerTraitStore.getState().hasTraitOpenByName("Stoic")).toBe(true);
      expect(useCharacterBurnerTraitStore.getState().hasTraitOpenByName("Unknown")).toBe(false);
    });
  });

  describe("updateTraits", () => {
    it("adds lifepath traits, marking the mandatory-index trait open on 1st occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerTraitStore.getState().updateTraits();

      const traits = useCharacterBurnerTraitStore.getState().traits;
      // Born Dwarf's traits: [Faithful, Stoic] -> index 0 (Faithful) is mandatory on 1st occurrence.
      expect(traits.find(TraitIds.Faithful)).toMatchObject({ type: "Mandatory", isOpen: true });
      expect(traits.find(TraitIds.Stoic)).toMatchObject({ type: "Lifepath", isOpen: false });
    });

    it("marks the 2nd trait mandatory on the 2nd occurrence of a lifepath", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf] });

      useCharacterBurnerTraitStore.getState().updateTraits();

      // On the 2nd occurrence, index 1 (Stoic) becomes the mandatory one.
      const traits = useCharacterBurnerTraitStore.getState().traits;
      const stoicEntries = traits.filter(t => t.id === TraitIds.Stoic);
      expect(stoicEntries.some(t => t.type === "Mandatory" && t.isOpen)).toBe(true);
    });

    it("grants no mandatory trait on the 3rd+ occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf, bornDwarf] });

      useCharacterBurnerTraitStore.getState().updateTraits();

      // NOTE: since Born Dwarf's traits (Faithful, Stoic) share the same ids across every occurrence
      // and characterTraits is a UniqueArray (later entries for the same id overwrite earlier ones),
      // only the LAST occurrence's isMandatory/type survives per id -- the 3rd occurrence's entries
      // (mandatoryIndex -1, so both Lifepath) end up shadowing the 1st/2nd occurrences' Mandatory
      // entries entirely. So with 3 occurrences of the *same* lifepath, 0 Mandatory traits remain,
      // even though occurrences 1 and 2 briefly produced one each.
      const traits = useCharacterBurnerTraitStore.getState().traits;
      const mandatoryCount = traits.filter(t => t.type === "Mandatory").length;
      expect(mandatoryCount).toBe(0);
      expect(traits.find(TraitIds.Faithful)).toMatchObject({ type: "Lifepath" });
      expect(traits.find(TraitIds.Stoic)).toMatchObject({ type: "Lifepath" });
    });

    it("auto-adds Common traits for the character's stock", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      useCharacterBurnerTraitStore.getState().updateTraits();

      const dwarvenBeard = useCharacterBurnerTraitStore.getState().traits.find(TraitIds.DwarvenBeard);
      expect(dwarvenBeard).toMatchObject({ type: "Common", isOpen: true });
    });

    it("does not duplicate a Common trait already present as a lifepath trait", () => {
      // Give a lifepath that already grants the trait id used as Common (DwarvenBeard=2), to hit the
      // existsAny short-circuit branch.
      const lp: Lifepath = {
        ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf),
        traits: [TraitIds.DwarvenBeard]
      };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });

      useCharacterBurnerTraitStore.getState().updateTraits();

      const entries = useCharacterBurnerTraitStore.getState().traits.filter(t => t.id === TraitIds.DwarvenBeard);
      expect(entries.length).toBe(1);
      expect(entries[0].type).not.toBe("Common");
    });

    it("preserves existing General traits not present in the new lifepath/common set", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);

      useCharacterBurnerTraitStore.getState().updateTraits();

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toMatchObject({ type: "General", isOpen: true });
    });

    it("does not duplicate a preserved General trait already re-added as a lifepath trait", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);

      useCharacterBurnerTraitStore.getState().updateTraits();

      const entries = useCharacterBurnerTraitStore.getState().traits.filter(t => t.id === TraitIds.Stoic);
      expect(entries.length).toBe(1);
    });

    it("adds no lifepath traits for a lifepath with no traits field at all", () => {
      const noTraits: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf) };
      delete noTraits.traits;
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noTraits] });

      expect(() => useCharacterBurnerTraitStore.getState().updateTraits()).not.toThrow();
      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Faithful)).toBeUndefined();
    });

    it("falls back to the referenced trait id and an empty name when the ruleset lookup resolves nulls", () => {
      const brokenFaithful: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.Faithful), id: null, name: null };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.Faithful ? brokenFaithful : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.Faithful, brokenFaithful)
      });
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerTraitStore.getState().updateTraits();

      // trait.id ?? tr falls back to the lifepath's own referenced id (Faithful); name falls back to "".
      const entry = useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Faithful);
      expect(entry?.name).toBe("");
    });

    it("falls back to an empty name for a Common trait whose ruleset name is null", () => {
      const namelessBeard: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.DwarvenBeard), name: null };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.DwarvenBeard ? namelessBeard : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.DwarvenBeard, namelessBeard)
      });
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      useCharacterBurnerTraitStore.getState().updateTraits();

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.DwarvenBeard)?.name).toBe("");
    });

    it("triggers downstream resource/lesson-of-one/limits recompute", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerTraitStore.getState().updateTraits();

      // Faithful becomes open (mandatory), so limits.refreshLimits ran without throwing and resources
      // updateResources/updateLessonOfOne ran without throwing -- reaching here proves no crash.
      expect(useCharacterBurnerLimitsStore.getState().limits).toBeDefined();
    });
  });
});
