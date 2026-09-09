import { beforeEach, describe, expect, it } from "vitest";

import { LifepathIds, ResourceIds, ResourceTypeIds, SeedRuleset, StockIds, TraitIds } from "./_fixtures/ruleset";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerResourceStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSpecialStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";


function setCharTraits(traits: CharacterTrait[]): void {
  useCharacterBurnerTraitStore.setState({ traits: new UniqueArray<dat.TraitId, CharacterTrait>(traits) });
}

describe("useCharacterBurnerResourceStore", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerResourceStore.getState().reset();
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });
  });

  describe("getResourcePools", () => {
    it("computes the total from lifepath resourcePoints with nothing spent", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });

      expect(useCharacterBurnerResourceStore.getState().getResourcePools()).toEqual({ total: 5, spent: 0, remaining: 5 });
    });

    it("halves the RP contribution (rounded down) on the 3rd occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf, bornDwarf] });

      // 5 + 5 + floor(5*0.5) = 12
      expect(useCharacterBurnerResourceStore.getState().getResourcePools().total).toBe(12);
    });

    it("stays halved (not further reduced) on the 4th+ occurrence", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, bornDwarf, bornDwarf, bornDwarf] });

      // 5 + 5 + 2 + 2 = 14
      expect(useCharacterBurnerResourceStore.getState().getResourcePools().total).toBe(14);
    });

    it("multiplies per-year RP for isRPMultipliedByYear lifepaths", () => {
      const lp: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.Miner), flags: { ...useRulesetStore.getState().getLifepath(LifepathIds.Miner).flags, isRPMultipliedByYear: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [lp] });

      // Miner's years is 5, resourcePoints is 10 per year -> 50
      expect(useCharacterBurnerResourceStore.getState().getResourcePools().total).toBe(50);
    });

    it("grants half of the previous lifepath's RP (rounded down) for getHalfRPFromPrevLP", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const miner: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.Miner), flags: { ...useRulesetStore.getState().getLifepath(LifepathIds.Miner).flags, getHalfRPFromPrevLP: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [bornDwarf, miner] });

      // bornDwarf RP 5, miner RP 10 + floor(5/2)=2 -> 12; total 5+12=17
      expect(useCharacterBurnerResourceStore.getState().getResourcePools().total).toBe(17);
    });

    it("spends the full cost for a non-trait-sourced resource", () => {
      useCharacterBurnerResourceStore.setState({
        resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "" } }
      });

      expect(useCharacterBurnerResourceStore.getState().getResourcePools().spent).toBe(5);
    });

    it("only counts the amount above minCost for a trait-sourced resource", () => {
      useCharacterBurnerResourceStore.setState({
        resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 10, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter, minCost: 5 } }
      });

      expect(useCharacterBurnerResourceStore.getState().getResourcePools().spent).toBe(5);
    });

    it("counts nothing when a trait-sourced resource's cost is at or below minCost", () => {
      useCharacterBurnerResourceStore.setState({
        resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter, minCost: 5 } }
      });

      expect(useCharacterBurnerResourceStore.getState().getResourcePools().spent).toBe(0);
    });

    it("uses an explicitly passed lifepaths array", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });

      expect(useCharacterBurnerResourceStore.getState().getResourcePools([bornDwarf]).total).toBe(5);
    });

    it("treats a null pools.resourcePoints as contributing 0", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const noRp: Lifepath = { ...bornDwarf, pools: { ...bornDwarf.pools, resourcePoints: null } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noRp] });

      expect(useCharacterBurnerResourceStore.getState().getResourcePools().total).toBe(0);
    });

    it("treats a null pools.resourcePoints as 0 even when isRPMultipliedByYear is set", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const noRp: Lifepath = { ...bornDwarf, pools: { ...bornDwarf.pools, resourcePoints: null }, flags: { ...bornDwarf.flags, isRPMultipliedByYear: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noRp] });

      expect(useCharacterBurnerResourceStore.getState().getResourcePools().total).toBe(0);
    });

    it("treats the previous lifepath's null resourcePoints as 0 for getHalfRPFromPrevLP", () => {
      const bornDwarf = useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf);
      const noRpPrev: Lifepath = { ...bornDwarf, pools: { ...bornDwarf.pools, resourcePoints: null } };
      const miner: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.Miner), flags: { ...useRulesetStore.getState().getLifepath(LifepathIds.Miner).flags, getHalfRPFromPrevLP: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [noRpPrev, miner] });

      // prev lifepath contributes 0 RP of its own and 0 to miner via the half-from-prev bonus;
      // miner's own flat RP is 10 -> total 0 + 10 = 10.
      expect(useCharacterBurnerResourceStore.getState().getResourcePools().total).toBe(10);
    });

    it("treats a trait-sourced resource's undefined minCost as 0 when computing spent", () => {
      useCharacterBurnerResourceStore.setState({
        resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter } }
      });

      expect(useCharacterBurnerResourceStore.getState().getResourcePools().spent).toBe(5);
    });

    it("does not apply the half-from-prev RP bonus to the first lifepath (no previous lifepath)", () => {
      const miner: Lifepath = { ...useRulesetStore.getState().getLifepath(LifepathIds.Miner), flags: { ...useRulesetStore.getState().getLifepath(LifepathIds.Miner).flags, getHalfRPFromPrevLP: true } };
      useCharacterBurnerLifepathStore.setState({ lifepaths: [miner] });

      // Miner's own flat RP is 10; no previous lifepath to draw from despite getHalfRPFromPrevLP.
      expect(useCharacterBurnerResourceStore.getState().getResourcePools().total).toBe(10);
    });
  });

  describe("addResource / removeResource / editResourceDescription", () => {
    it("adds a resource under a new random key", () => {
      useCharacterBurnerResourceStore.getState().addResource({ id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "" });

      expect(Object.keys(useCharacterBurnerResourceStore.getState().resources).length).toBe(1);
    });

    it("removes a non-trait-sourced resource", () => {
      useCharacterBurnerResourceStore.setState({ resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "" } } });

      useCharacterBurnerResourceStore.getState().removeResource("r1");

      expect(useCharacterBurnerResourceStore.getState().resources["r1"]).toBeUndefined();
    });

    it("does not remove a trait-sourced resource", () => {
      useCharacterBurnerResourceStore.setState({ resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter } } });

      useCharacterBurnerResourceStore.getState().removeResource("r1");

      expect(useCharacterBurnerResourceStore.getState().resources["r1"]).toBeDefined();
    });

    it("no-ops removing a resource that does not exist", () => {
      useCharacterBurnerResourceStore.getState().removeResource("missing");
      expect(useCharacterBurnerResourceStore.getState().resources["missing"]).toBeUndefined();
    });

    it("edits a resource's description", () => {
      useCharacterBurnerResourceStore.setState({ resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "" } } });

      useCharacterBurnerResourceStore.getState().editResourceDescription("r1", "A family relic");

      expect(useCharacterBurnerResourceStore.getState().resources["r1"].description).toBe("A family relic");
    });
  });

  describe("upgradeResourceCost", () => {
    it("no-ops for a resource that is not trait-sourced", () => {
      useCharacterBurnerResourceStore.setState({ resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "" } } });

      useCharacterBurnerResourceStore.getState().upgradeResourceCost("r1", 10);

      expect(useCharacterBurnerResourceStore.getState().resources["r1"].cost).toBe(5);
    });

    it("no-ops when the new cost is below minCost", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      useCharacterBurnerResourceStore.setState({ resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter, minCost: 5 } } });

      useCharacterBurnerResourceStore.getState().upgradeResourceCost("r1", 4);

      expect(useCharacterBurnerResourceStore.getState().resources["r1"].cost).toBe(5);
    });

    it("no-ops when the additional cost exceeds the remaining pool", () => {
      useCharacterBurnerLifepathStore.setState({ lifepaths: [] });
      useCharacterBurnerResourceStore.setState({ resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter, minCost: 5 } } });

      useCharacterBurnerResourceStore.getState().upgradeResourceCost("r1", 20);

      expect(useCharacterBurnerResourceStore.getState().resources["r1"].cost).toBe(5);
    });

    it("upgrades the cost when within budget", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      useCharacterBurnerResourceStore.setState({ resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter, minCost: 5 } } });

      useCharacterBurnerResourceStore.getState().upgradeResourceCost("r1", 8);

      expect(useCharacterBurnerResourceStore.getState().resources["r1"].cost).toBe(8);
    });

    it("treats an undefined minCost as 0 when checking the new-cost floor", () => {
      const lifepaths = [useRulesetStore.getState().getLifepath(LifepathIds.BornDwarf)];
      useCharacterBurnerLifepathStore.setState({ lifepaths });
      useCharacterBurnerResourceStore.setState({ resources: { "r1": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter } } });

      useCharacterBurnerResourceStore.getState().upgradeResourceCost("r1", -1);

      expect(useCharacterBurnerResourceStore.getState().resources["r1"].cost).toBe(5);
    });
  });

  describe("setFamilyHeirloomResource / clearFamilyHeirloomResource", () => {
    it("sets the family heirloom resource, capping cost at 50", () => {
      const resource = useRulesetStore.getState().getResource(ResourceIds.Heirloom);

      useCharacterBurnerResourceStore.getState().setFamilyHeirloomResource(TraitIds.FamilyHeirloomGranter, resource, 100);

      expect(useCharacterBurnerResourceStore.getState().resources["family-heirloom"].cost).toBe(50);
    });

    it("no-ops when the resource has a null type id", () => {
      const resource = { ...useRulesetStore.getState().getResource(ResourceIds.Heirloom), type: [null, "Property"] as unknown as [dat.ResourceTypeId, string] };

      useCharacterBurnerResourceStore.getState().setFamilyHeirloomResource(TraitIds.FamilyHeirloomGranter, resource, 10);

      expect(useCharacterBurnerResourceStore.getState().resources["family-heirloom"]).toBeUndefined();
    });

    it("sets the family heirloom resource when its type id is the legitimate value 0", () => {
      // dat.ResourceTypeId 0 is a valid id (Nominal<number, ...> has no reserved sentinel) --
      // setFamilyHeirloomResource's guard checks `=== null`, not falsiness, so it's not confused
      // with a missing type id.
      const resource = { ...useRulesetStore.getState().getResource(ResourceIds.Heirloom), type: [ResourceTypeIds.ZeroId, "Property"] as [dat.ResourceTypeId, string] };

      useCharacterBurnerResourceStore.getState().setFamilyHeirloomResource(TraitIds.FamilyHeirloomGranter, resource, 10);

      expect(useCharacterBurnerResourceStore.getState().resources["family-heirloom"]).toBeDefined();
      expect(useCharacterBurnerResourceStore.getState().resources["family-heirloom"]?.type[0]).toBe(ResourceTypeIds.ZeroId);
    });

    it("clears the family heirloom resource", () => {
      const resource = useRulesetStore.getState().getResource(ResourceIds.Heirloom);
      useCharacterBurnerResourceStore.getState().setFamilyHeirloomResource(TraitIds.FamilyHeirloomGranter, resource, 10);

      useCharacterBurnerResourceStore.getState().clearFamilyHeirloomResource();

      expect(useCharacterBurnerResourceStore.getState().resources["family-heirloom"]).toBeUndefined();
    });
  });

  describe("updateLessonOfOne", () => {
    it("removes the lesson-of-one entry when the trait is not open", () => {
      useCharacterBurnerResourceStore.setState({ resources: { "lesson-of-one": { id: ResourceIds.Reputation, name: "Guild Standing", type: [ResourceTypeIds.Reputation, "Reputation"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.Stoic, minCost: 5 } } });

      useCharacterBurnerResourceStore.getState().updateLessonOfOne();

      expect(useCharacterBurnerResourceStore.getState().resources["lesson-of-one"]).toBeUndefined();
    });

    it("removes the entry when the chosen relationship's cost is neither 10 nor 15", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 3, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });

      useCharacterBurnerResourceStore.getState().updateLessonOfOne();

      expect(useCharacterBurnerResourceStore.getState().resources["lesson-of-one"]).toBeUndefined();
    });

    it("grants a 1D reputation for an 'important' (cost 10) relationship", () => {
      // updateLessonOfOne resolves the trait via a by-NAME ruleset lookup (ruleset.getTrait("Lesson
      // of One")), independent of the character trait's own name -- so the ruleset fixture's Stoic
      // trait needs to be renamed to match for this lookup to succeed.
      const renamed: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.Stoic), name: "Lesson of One" };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.Stoic ? renamed : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.Stoic, renamed)
      });
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 10, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });

      useCharacterBurnerResourceStore.getState().updateLessonOfOne();

      const lesson = useCharacterBurnerResourceStore.getState().resources["lesson-of-one"];
      expect(lesson).toBeDefined();
      expect(lesson?.cost).toBe(5); // "1D reputation" cost row
    });

    it("grants a 2D reputation for a 'powerful' (cost 15) relationship", () => {
      const renamed: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.Stoic), name: "Lesson of One" };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.Stoic ? renamed : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.Stoic, renamed)
      });
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 15, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });

      useCharacterBurnerResourceStore.getState().updateLessonOfOne();

      const lesson = useCharacterBurnerResourceStore.getState().resources["lesson-of-one"];
      expect(lesson?.cost).toBe(10); // "2D reputation" cost row
    });

    it("removes the entry when no relationship is chosen", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);

      useCharacterBurnerResourceStore.getState().updateLessonOfOne();

      expect(useCharacterBurnerResourceStore.getState().resources["lesson-of-one"]).toBeUndefined();
    });

    it("does nothing when the character's stock has no Reputation resource in the ruleset", () => {
      const renamed: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.Stoic), name: "Lesson of One" };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.Stoic ? renamed : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.Stoic, renamed),
        resources: useRulesetStore.getState().resources.filter(r => r.id !== ResourceIds.Reputation)
      });
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 10, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });

      expect(() => useCharacterBurnerResourceStore.getState().updateLessonOfOne()).not.toThrow();
      expect(useCharacterBurnerResourceStore.getState().resources["lesson-of-one"]).toBeUndefined();
    });

    it("does nothing when the stock's Reputation resource has no resourceTypeId", () => {
      const renamed: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.Stoic), name: "Lesson of One" };
      const reputation = useRulesetStore.getState().getResource(ResourceIds.Reputation);
      const typelessReputation: Resource = { ...reputation, type: [null as unknown as dat.ResourceTypeId, "Reputation"] };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.Stoic ? renamed : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.Stoic, renamed),
        resources: useRulesetStore.getState().resources.map(r => r.id === ResourceIds.Reputation ? typelessReputation : r),
        resourcesById: new Map(useRulesetStore.getState().resourcesById).set(ResourceIds.Reputation, typelessReputation)
      });
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 10, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });

      expect(() => useCharacterBurnerResourceStore.getState().updateLessonOfOne()).not.toThrow();
      expect(useCharacterBurnerResourceStore.getState().resources["lesson-of-one"]).toBeUndefined();
    });

    it("falls back to the first cost row when no cost row's label matches the tier", () => {
      const renamed: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.Stoic), name: "Lesson of One" };
      const reputation = useRulesetStore.getState().getResource(ResourceIds.Reputation);
      const relabeledReputation: Resource = { ...reputation, costs: [[7, "unlabeled"], [9, "also unlabeled"]] };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.Stoic ? renamed : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.Stoic, renamed),
        resources: useRulesetStore.getState().resources.map(r => r.id === ResourceIds.Reputation ? relabeledReputation : r),
        resourcesById: new Map(useRulesetStore.getState().resourcesById).set(ResourceIds.Reputation, relabeledReputation)
      });
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 10, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });

      useCharacterBurnerResourceStore.getState().updateLessonOfOne();

      expect(useCharacterBurnerResourceStore.getState().resources["lesson-of-one"]?.cost).toBe(7);
    });

    it("grants the resource when the 'Lesson of One' trait resolves with the legitimate id 0", () => {
      const zeroId = 0 as dat.TraitId;
      const renamed: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.Stoic), id: zeroId, name: "Lesson of One" };
      useRulesetStore.setState({
        traits: [...useRulesetStore.getState().traits.filter(t => t.id !== TraitIds.Stoic), renamed],
        traitsById: new Map([...useRulesetStore.getState().traitsById].filter(([id]) => id !== TraitIds.Stoic)).set(zeroId, renamed)
      });
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 10, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });

      useCharacterBurnerResourceStore.getState().updateLessonOfOne();

      const lesson = useCharacterBurnerResourceStore.getState().resources["lesson-of-one"];
      expect(lesson).toBeDefined();
      expect(lesson?.sourceTraitId).toBe(zeroId);
    });

    it("does nothing when the 'Lesson of One' trait resolves with a null id", () => {
      const renamed: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.Stoic), id: null, name: "Lesson of One" };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.Stoic ? renamed : t),
        traitsById: new Map([...useRulesetStore.getState().traitsById].filter(([id]) => id !== TraitIds.Stoic))
      });
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 10, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });

      expect(() => useCharacterBurnerResourceStore.getState().updateLessonOfOne()).not.toThrow();
      expect(useCharacterBurnerResourceStore.getState().resources["lesson-of-one"]).toBeUndefined();
    });

    it("does nothing when the ruleset has no 'Lesson of One'-named trait to attribute the grant to", () => {
      // No trait renamed to "Lesson of One" in the ruleset here -- ruleset.getTrait("Lesson of One")
      // throws (no match), which updateLessonOfOne does not catch, so the whole call throws instead
      // of silently no-oping.
      setCharTraits([{ id: TraitIds.Stoic, name: "Lesson of One", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.setState({
        resources: {
          "rel": { id: ResourceIds.Relation, name: "Mentor", type: [ResourceTypeIds.Relationship, "Relationship"], modifiers: [], cost: 10, description: "" }
        }
      });
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, lessonOfOneRelationship: "rel" } });
      useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });

      expect(() => useCharacterBurnerResourceStore.getState().updateLessonOfOne()).toThrow();
    });
  });

  describe("updateResources", () => {
    it("grants a non-choice trait's resources, keyed by trait+resource id", () => {
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: true }]);

      useCharacterBurnerResourceStore.getState().updateResources();

      const key = `trait-${TraitIds.FamilyHeirloomGranter.toString()}-${ResourceIds.Heirloom.toString()}`;
      expect(useCharacterBurnerResourceStore.getState().resources[key]).toMatchObject({ sourceTraitId: TraitIds.FamilyHeirloomGranter, cost: 5 });
    });

    it("removes a stale trait-granted resource when the trait is no longer open", () => {
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.getState().updateResources();
      const key = `trait-${TraitIds.FamilyHeirloomGranter.toString()}-${ResourceIds.Heirloom.toString()}`;
      expect(useCharacterBurnerResourceStore.getState().resources[key]).toBeDefined();

      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: false }]);
      useCharacterBurnerResourceStore.getState().updateResources();

      expect(useCharacterBurnerResourceStore.getState().resources[key]).toBeUndefined();
    });

    it("preserves an existing player-edited cost/description for a still-open trait-granted resource", () => {
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: true }]);
      useCharacterBurnerResourceStore.getState().updateResources();
      const key = `trait-${TraitIds.FamilyHeirloomGranter.toString()}-${ResourceIds.Heirloom.toString()}`;
      useCharacterBurnerResourceStore.getState().editResourceDescription(key, "Grandpa's axe");
      useCharacterBurnerResourceStore.setState({
        resources: { ...useCharacterBurnerResourceStore.getState().resources, [key]: { ...useCharacterBurnerResourceStore.getState().resources[key], cost: 15 } }
      });

      useCharacterBurnerResourceStore.getState().updateResources();

      expect(useCharacterBurnerResourceStore.getState().resources[key].cost).toBe(15);
      expect(useCharacterBurnerResourceStore.getState().resources[key].description).toBe("Grandpa's axe");
    });

    it("removes the family-heirloom key when Family Heirloom is not open", () => {
      useCharacterBurnerResourceStore.setState({ resources: { "family-heirloom": { id: ResourceIds.Heirloom, name: "Heirloom Axe", type: [ResourceTypeIds.Property, "Property"], modifiers: [], cost: 5, description: "", sourceTraitId: TraitIds.FamilyHeirloomGranter, minCost: 0 } } });
      setCharTraits([]);

      useCharacterBurnerResourceStore.getState().updateResources();

      expect(useCharacterBurnerResourceStore.getState().resources["family-heirloom"]).toBeUndefined();
    });

    it("skips a trait with no grantsResources entries", () => {
      setCharTraits([{ id: TraitIds.Stoic, name: "Stoic", type: "General", isOpen: true }]);

      useCharacterBurnerResourceStore.getState().updateResources();

      expect(Object.keys(useCharacterBurnerResourceStore.getState().resources).length).toBe(0);
    });

    it("gates Servant of the Citadel's resource grant on servantOfCitadelQualifies", () => {
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.FamilyHeirloomGranter ? { ...t, name: "Servant of the Citadel" } : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.FamilyHeirloomGranter, { ...useRulesetStore.getState().traitsById.get(TraitIds.FamilyHeirloomGranter)!, name: "Servant of the Citadel" })
      });
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Servant of the Citadel", type: "General", isOpen: true }]);

      useCharacterBurnerResourceStore.getState().updateResources();

      expect(Object.keys(useCharacterBurnerResourceStore.getState().resources).length).toBe(0);
    });

    it("grants Servant of the Citadel's resource once servantOfCitadelQualifies is true", () => {
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.FamilyHeirloomGranter ? { ...t, name: "Servant of the Citadel" } : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.FamilyHeirloomGranter, { ...useRulesetStore.getState().traitsById.get(TraitIds.FamilyHeirloomGranter)!, name: "Servant of the Citadel" })
      });
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Servant of the Citadel", type: "General", isOpen: true }]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, servantOfCitadelQualifies: true } });

      useCharacterBurnerResourceStore.getState().updateResources();

      expect(Object.keys(useCharacterBurnerResourceStore.getState().resources).length).toBe(1);
    });

    it("gates Sworn to Protect's resource grant on swornToProtectQualifies", () => {
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.FamilyHeirloomGranter ? { ...t, name: "Sworn to Protect" } : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.FamilyHeirloomGranter, { ...useRulesetStore.getState().traitsById.get(TraitIds.FamilyHeirloomGranter)!, name: "Sworn to Protect" })
      });
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Sworn to Protect", type: "General", isOpen: true }]);

      useCharacterBurnerResourceStore.getState().updateResources();

      expect(Object.keys(useCharacterBurnerResourceStore.getState().resources).length).toBe(0);
    });

    it("picks the choice grant matching chosenResourceType when isChoice and multiple grants exist", () => {
      // Repurpose FamilyHeirloomGranter as an isChoice trait with two possible resource grants.
      const patchedTrait: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.FamilyHeirloomGranter), grantsResourcesIsChoice: true, grantsResources: [{ resource: ResourceIds.Heirloom, minCost: 5 }, { resource: ResourceIds.Reputation, minCost: 5 }] };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.FamilyHeirloomGranter ? patchedTrait : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.FamilyHeirloomGranter, patchedTrait)
      });
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: true }]);
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, chosenResourceType: { [TraitIds.FamilyHeirloomGranter]: ResourceTypeIds.Reputation } } });

      useCharacterBurnerResourceStore.getState().updateResources();

      const key = `trait-${TraitIds.FamilyHeirloomGranter.toString()}`;
      expect(useCharacterBurnerResourceStore.getState().resources[key]?.id).toBe(ResourceIds.Reputation);
    });

    it("defaults to the first grant for an isChoice trait when nothing is chosen yet", () => {
      const patchedTrait: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.FamilyHeirloomGranter), grantsResourcesIsChoice: true, grantsResources: [{ resource: ResourceIds.Heirloom, minCost: 5 }, { resource: ResourceIds.Reputation, minCost: 5 }] };
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.FamilyHeirloomGranter ? patchedTrait : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.FamilyHeirloomGranter, patchedTrait)
      });
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: true }]);

      useCharacterBurnerResourceStore.getState().updateResources();

      const key = `trait-${TraitIds.FamilyHeirloomGranter.toString()}`;
      expect(useCharacterBurnerResourceStore.getState().resources[key]?.id).toBe(ResourceIds.Heirloom);
    });

    it("throws when a granted resource has no resourceTypeId", () => {
      const brokenResource: Resource = { ...useRulesetStore.getState().getResource(ResourceIds.Heirloom), type: [null as unknown as dat.ResourceTypeId, "Property"] };
      useRulesetStore.setState({
        resources: useRulesetStore.getState().resources.map(r => r.id === ResourceIds.Heirloom ? brokenResource : r),
        resourcesById: new Map(useRulesetStore.getState().resourcesById).set(ResourceIds.Heirloom, brokenResource)
      });
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: true }]);

      expect(() => useCharacterBurnerResourceStore.getState().updateResources()).toThrow();
    });

    it("defaults grantsResourcesIsChoice to true when the ruleset trait omits the field", () => {
      const patchedTrait: Trait = { ...useRulesetStore.getState().getTrait(TraitIds.FamilyHeirloomGranter) };
      delete (patchedTrait as { grantsResourcesIsChoice?: boolean; }).grantsResourcesIsChoice;
      useRulesetStore.setState({
        traits: useRulesetStore.getState().traits.map(t => t.id === TraitIds.FamilyHeirloomGranter ? patchedTrait : t),
        traitsById: new Map(useRulesetStore.getState().traitsById).set(TraitIds.FamilyHeirloomGranter, patchedTrait)
      });
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: true }]);

      useCharacterBurnerResourceStore.getState().updateResources();

      // isChoice's key omits the resource-id suffix (`trait-<id>`), unlike the non-choice branch's
      // `trait-<id>-<resourceId>` -- confirms the ?? true default routed through the isChoice path.
      const key = `trait-${TraitIds.FamilyHeirloomGranter.toString()}`;
      expect(useCharacterBurnerResourceStore.getState().resources[key]?.id).toBe(ResourceIds.Heirloom);
    });

    it("skips a closed trait entirely", () => {
      setCharTraits([{ id: TraitIds.FamilyHeirloomGranter, name: "Family Heirloom", type: "General", isOpen: false }]);

      useCharacterBurnerResourceStore.getState().updateResources();

      expect(Object.keys(useCharacterBurnerResourceStore.getState().resources).length).toBe(0);
    });
  });
});
