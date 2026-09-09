import { beforeEach, describe, expect, it } from "vitest";

import { LifepathIds, SeedRuleset, StockIds } from "./_fixtures/ruleset";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";


function setTraits(names: string[]): void {
  useCharacterBurnerTraitStore.setState({
    traits: new UniqueArray<dat.TraitId, CharacterTrait>(
      names.map((name, i) => ({ id: i as dat.TraitId, name, type: "General", isOpen: true }))
    )
  });
}

describe("useCharacterBurnerBasicsStore", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerBasicsStore.setState({
      stock: [StockIds.Dwarf, "Dwarf"],
      concept: "",
      name: "",
      gender: "Male",
      beliefs: [
        { name: "Belief 1", belief: "" },
        { name: "Belief 2", belief: "" },
        { name: "Belief 3", belief: "" },
        { name: "Special Belief", belief: "" }
      ],
      instincts: [
        { name: "Instinct 1", instinct: "" },
        { name: "Instinct 2", instinct: "" },
        { name: "Instinct 3", instinct: "" },
        { name: "Special Instinct", instinct: "" }
      ]
    });
  });

  describe("setName / setConcept / setGender", () => {
    it("sets the character's name", () => {
      useCharacterBurnerBasicsStore.getState().setName("Torvald");
      expect(useCharacterBurnerBasicsStore.getState().name).toBe("Torvald");
    });

    it("sets the character's concept", () => {
      useCharacterBurnerBasicsStore.getState().setConcept("A wandering smith");
      expect(useCharacterBurnerBasicsStore.getState().concept).toBe("A wandering smith");
    });

    it("sets the character's gender", () => {
      useCharacterBurnerBasicsStore.getState().setGender("Female");
      expect(useCharacterBurnerBasicsStore.getState().gender).toBe("Female");
    });
  });

  describe("setBelief / setInstinct", () => {
    it("sets a belief at the given index", () => {
      useCharacterBurnerBasicsStore.getState().setBelief(1, "I believe in the mountain");
      expect(useCharacterBurnerBasicsStore.getState().beliefs[1].belief).toBe("I believe in the mountain");
    });

    it("sets an instinct at the given index", () => {
      useCharacterBurnerBasicsStore.getState().setInstinct(2, "Always carry a hammer");
      expect(useCharacterBurnerBasicsStore.getState().instincts[2].instinct).toBe("Always carry a hammer");
    });
  });

  describe("setStockAndReset", () => {
    it("resets basics fields to defaults and applies the new stock", () => {
      useCharacterBurnerBasicsStore.getState().setName("Torvald");
      useCharacterBurnerBasicsStore.getState().setConcept("Smith");
      useCharacterBurnerBasicsStore.getState().setGender("Female");

      useCharacterBurnerBasicsStore.getState().setStockAndReset([1 as dat.StockId, "Elf"]);

      const state = useCharacterBurnerBasicsStore.getState();
      expect(state.stock).toEqual([1, "Elf"]);
      expect(state.name).toBe("");
      expect(state.concept).toBe("");
      expect(state.gender).toBe("Male");
      expect(state.beliefs.every(b => b.belief === "")).toBe(true);
    });

    it("also fully resets the character burner (ResetCharacterBurner side effect)", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      useCharacterBurnerBasicsStore.getState().setStockAndReset([StockIds.Dwarf, "Dwarf"]);

      expect(useCharacterBurnerLifepathStore.getState().lifepaths).toEqual([]);
    });
  });

  describe("getAgePool", () => {
    it("returns all-zero pools at age 0", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });
      expect(useCharacterBurnerBasicsStore.getState().getAgePool()).toEqual({ minAge: 0, mentalPool: 0, physicalPool: 0 });
    });

    it("returns the fixed Vigor of Youth pool for an age > 40 character with that trait", () => {
      const oldLp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), years: 45 };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [oldLp] });
      setTraits(["Vigor of Youth"]);

      expect(useCharacterBurnerBasicsStore.getState().getAgePool()).toEqual({ minAge: 0, mentalPool: 7, physicalPool: 14 });
    });

    it("does not apply Vigor of Youth override at age <= 40", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });
      setTraits(["Vigor of Youth"]);

      const result = useCharacterBurnerBasicsStore.getState().getAgePool();
      expect(result).toEqual({ minAge: 0, mentalPool: 7, physicalPool: 14 });
    });

    it("selects a normal stock age-pool bracket by age", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf] });

      // age 16 -> only the minAge:0 bracket qualifies (16 > 0, not > 25).
      expect(useCharacterBurnerBasicsStore.getState().getAgePool()).toEqual({ minAge: 0, mentalPool: 7, physicalPool: 14 });
    });

    it("picks the highest-minAge qualifying bracket (the closest one below the character's age) when several brackets qualify", () => {
      // getAgePool's bracket selection is `agePool.filter(a => age > a.minAge).reduce((pv, cv) =>
      // pv.minAge > cv.minAge ? pv : cv)` -- among the brackets the age qualifies for, this keeps the
      // HIGHEST minAge one, i.e. the most specific/closest bracket below the character's actual age.
      // At age 41 (> 40, so Vigor of Youth would apply if the trait were open -- it isn't here), both
      // the minAge:0 and minAge:25 Dwarf brackets qualify, and the more specific minAge:25 bracket
      // (10/18) wins over the minAge:0 bracket (7/14).
      const oldLp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), years: 41 };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [oldLp] });

      expect(useCharacterBurnerBasicsStore.getState().getAgePool()).toEqual({ minAge: 25, mentalPool: 10, physicalPool: 18 });
    });

    it("picks the later-iterated bracket when it has a higher minAge than the one before it in the array", () => {
      // Exercises the reduce's `: cv` branch specifically: with the stock's agePool array given out
      // of minAge order, the highest-minAge qualifying bracket can be the LATER array element, so the
      // reduce must actually pick `cv` over the running `pv` at least once.
      const dwarf = useRulesetStore.getState().getStock(StockIds.Dwarf);
      useRulesetStore.setState({
        stocksById: new Map([[StockIds.Dwarf, {
          ...dwarf,
          agePool: [
            { minAge: 0, mentalPool: 7, physicalPool: 14 },
            { minAge: 25, mentalPool: 10, physicalPool: 18 }
          ]
        }]])
      });

      const oldLp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), years: 41 };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [oldLp] });

      expect(useCharacterBurnerBasicsStore.getState().getAgePool()).toEqual({ minAge: 25, mentalPool: 10, physicalPool: 18 });
    });

    it("keeps the running highest-minAge bracket when a later array element has a lower minAge", () => {
      // Exercises the reduce's `: pv` branch specifically: with the highest-minAge qualifying bracket
      // appearing BEFORE a lower one in the array, the reduce must keep `pv` rather than switching to
      // the lower `cv`.
      const dwarf = useRulesetStore.getState().getStock(StockIds.Dwarf);
      useRulesetStore.setState({
        stocksById: new Map([[StockIds.Dwarf, {
          ...dwarf,
          agePool: [
            { minAge: 25, mentalPool: 10, physicalPool: 18 },
            { minAge: 0, mentalPool: 7, physicalPool: 14 }
          ]
        }]])
      });

      const oldLp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf), years: 41 };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [oldLp] });

      expect(useCharacterBurnerBasicsStore.getState().getAgePool()).toEqual({ minAge: 25, mentalPool: 10, physicalPool: 18 });
    });
  });
});
