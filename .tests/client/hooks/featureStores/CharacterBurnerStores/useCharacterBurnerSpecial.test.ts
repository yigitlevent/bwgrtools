import { beforeEach, describe, expect, it } from "vitest";

import { AbilityIds, LifepathIds, QuestionIds, ResourceTypeIds, SeedRuleset, SkillIds, StockIds, TraitIds } from "./_fixtures/ruleset";
import { useRulesetStore } from "../../../../../client/src/hooks/apiStores/useRulesetStore";
import { CreateInitialSpecial } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/createInitialSpecial";
import { useCharacterBurnerAttributeStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerResourceStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { UniqueArray } from "../../../../../client/src/utils/UniqueArray";


describe("useCharacterBurnerSpecialStore", () => {
  beforeEach(() => {
    SeedRuleset();
    useCharacterBurnerSpecialStore.getState().reset();
    useCharacterBurnerTraitStore.getState().reset();
    useCharacterBurnerResourceStore.getState().reset();
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerStatStore.getState().reset();
    useCharacterBurnerSkillStore.getState().reset();
    useCharacterBurnerAttributeStore.getState().reset();
    useCharacterBurnerBasicsStore.setState({ stock: [StockIds.Dwarf, "Dwarf"] });
  });

  describe("reset", () => {
    it("resets special and questions to initial state", () => {
      useCharacterBurnerSpecialStore.getState().modifyAvariceGreed(5);
      useCharacterBurnerSpecialStore.getState().reset();

      expect(useCharacterBurnerSpecialStore.getState().special).toEqual(CreateInitialSpecial());
      expect(useCharacterBurnerSpecialStore.getState().questions).toEqual([]);
    });
  });

  describe("modifyCompanionLifepath", () => {
    it("sets the companion lifepath id and recomputes", () => {
      useCharacterBurnerSpecialStore.getState().modifyCompanionLifepath("Pit Pony", LifepathIds.Miner);
      expect(useCharacterBurnerSpecialStore.getState().special.companionLifepath["Pit Pony"]).toBe(LifepathIds.Miner);
    });
  });

  describe("modifyVariableAge", () => {
    it("clamps the age within the given min/max", () => {
      useCharacterBurnerSpecialStore.getState().modifyVariableAge(LifepathIds.Miner, 100, [1, 10]);
      expect(useCharacterBurnerSpecialStore.getState().special.variableAge[LifepathIds.Miner]).toBe(10);
    });

    it("accepts an in-range age unmodified", () => {
      useCharacterBurnerSpecialStore.getState().modifyVariableAge(LifepathIds.Miner, 5, [1, 10]);
      expect(useCharacterBurnerSpecialStore.getState().special.variableAge[LifepathIds.Miner]).toBe(5);
    });
  });

  describe("modifyCompanionSkills", () => {
    it("sets companion skills and recomputes when skills is defined", () => {
      useCharacterBurnerSpecialStore.getState().modifyCompanionSkills(LifepathIds.Miner, [SkillIds.Doctrine]);
      expect(useCharacterBurnerSpecialStore.getState().special.companionSkills[LifepathIds.Miner]).toEqual([SkillIds.Doctrine]);
    });

    it("no-ops when skills is undefined", () => {
      useCharacterBurnerSpecialStore.getState().modifyCompanionSkills(LifepathIds.Miner, undefined);
      expect(useCharacterBurnerSpecialStore.getState().special.companionSkills[LifepathIds.Miner]).toBeUndefined();
    });
  });

  describe("modifySkillSubskills", () => {
    it("sets multiple subskills when canSelectMultiple is true", () => {
      useCharacterBurnerSpecialStore.getState().modifySkillSubskills(SkillIds.Sword, [SkillIds.Doctrine], true);
      expect(useCharacterBurnerSpecialStore.getState().special.chosenSubskills[SkillIds.Sword]).toEqual([SkillIds.Doctrine]);
    });

    it("sets an empty array when subskillIds is null", () => {
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: [SkillIds.Doctrine] } } });
      useCharacterBurnerSpecialStore.getState().modifySkillSubskills(SkillIds.Sword, null, false);
      expect(useCharacterBurnerSpecialStore.getState().special.chosenSubskills[SkillIds.Sword]).toEqual([]);
    });

    it("toggles off a single already-chosen subskill", () => {
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: [SkillIds.Doctrine] } } });
      useCharacterBurnerSpecialStore.getState().modifySkillSubskills(SkillIds.Sword, [SkillIds.Doctrine], false);
      expect(useCharacterBurnerSpecialStore.getState().special.chosenSubskills[SkillIds.Sword]).toEqual([]);
    });

    it("sets a single new subskill choice when not canSelectMultiple", () => {
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: [] } } });
      useCharacterBurnerSpecialStore.getState().modifySkillSubskills(SkillIds.Sword, [SkillIds.Doctrine], false);
      expect(useCharacterBurnerSpecialStore.getState().special.chosenSubskills[SkillIds.Sword]).toEqual([SkillIds.Doctrine]);
    });
  });

  describe("resetSkillSubskills", () => {
    it("initializes an empty chosenSubskills entry for skills not already present", () => {
      useCharacterBurnerSpecialStore.getState().resetSkillSubskills([SkillIds.Sword]);
      expect(useCharacterBurnerSpecialStore.getState().special.chosenSubskills[SkillIds.Sword]).toEqual([]);
    });

    it("does not overwrite an existing chosenSubskills entry", () => {
      useCharacterBurnerSpecialStore.setState({ special: { ...useCharacterBurnerSpecialStore.getState().special, chosenSubskills: { [SkillIds.Sword]: [SkillIds.Doctrine] } } });
      useCharacterBurnerSpecialStore.getState().resetSkillSubskills([SkillIds.Sword]);
      expect(useCharacterBurnerSpecialStore.getState().special.chosenSubskills[SkillIds.Sword]).toEqual([SkillIds.Doctrine]);
    });
  });

  describe("modifyChosenResourceType", () => {
    it("sets the chosen resource type and triggers updateResources", () => {
      useCharacterBurnerSpecialStore.getState().modifyChosenResourceType(TraitIds.Stoic, ResourceTypeIds.Property);
      expect(useCharacterBurnerSpecialStore.getState().special.chosenResourceType[TraitIds.Stoic]).toBe(ResourceTypeIds.Property);
    });
  });

  describe("modifyAvariceGreed", () => {
    it("sets avariceGreed to undefined when passed undefined", () => {
      useCharacterBurnerSpecialStore.getState().modifyAvariceGreed(3);
      useCharacterBurnerSpecialStore.getState().modifyAvariceGreed(undefined);
      expect(useCharacterBurnerSpecialStore.getState().special.avariceGreed).toBeUndefined();
    });

    it("clamps to at least naturalGreed + 1", () => {
      useCharacterBurnerSpecialStore.getState().modifyAvariceGreed(-100);
      const natural = useCharacterBurnerAttributeStore.getState().getNaturalGreed();
      expect(useCharacterBurnerSpecialStore.getState().special.avariceGreed).toBe(natural + 1);
    });

    it("accepts a value already above the minimum", () => {
      const natural = useCharacterBurnerAttributeStore.getState().getNaturalGreed();
      useCharacterBurnerSpecialStore.getState().modifyAvariceGreed(natural + 10);
      expect(useCharacterBurnerSpecialStore.getState().special.avariceGreed).toBe(natural + 10);
    });
  });

  describe("modifyCrippledStat / modifyFrailStat / modifyMissingLimb", () => {
    it("sets crippledStat and refreshes limits", () => {
      useCharacterBurnerSpecialStore.getState().modifyCrippledStat(AbilityIds.Forte);
      expect(useCharacterBurnerSpecialStore.getState().special.crippledStat).toBe(AbilityIds.Forte);
    });

    it("sets frailStat and refreshes limits", () => {
      useCharacterBurnerSpecialStore.getState().modifyFrailStat(AbilityIds.Forte);
      expect(useCharacterBurnerSpecialStore.getState().special.frailStat).toBe(AbilityIds.Forte);
    });

    it("sets missingLimb and refreshes limits", () => {
      useCharacterBurnerSpecialStore.getState().modifyMissingLimb(AbilityIds.Agility);
      expect(useCharacterBurnerSpecialStore.getState().special.missingLimb).toBe(AbilityIds.Agility);
    });

    it("clears crippledStat/frailStat/missingLimb when passed undefined", () => {
      useCharacterBurnerSpecialStore.getState().modifyCrippledStat(AbilityIds.Forte);
      useCharacterBurnerSpecialStore.getState().modifyCrippledStat(undefined);
      expect(useCharacterBurnerSpecialStore.getState().special.crippledStat).toBeUndefined();
    });
  });

  describe("modifyChildProdigyStat / modifyChildProdigyShiftedSkill", () => {
    it("setting a stat clears the shifted skill (mutually exclusive)", () => {
      useCharacterBurnerSpecialStore.getState().modifyChildProdigyShiftedSkill(SkillIds.Doctrine);
      useCharacterBurnerSpecialStore.getState().modifyChildProdigyStat(AbilityIds.Perception);

      const { special } = useCharacterBurnerSpecialStore.getState();
      expect(special.childProdigyStat).toBe(AbilityIds.Perception);
      expect(special.childProdigyShiftedSkill).toBeUndefined();
    });

    it("setting a shifted skill clears the stat (mutually exclusive)", () => {
      useCharacterBurnerSpecialStore.getState().modifyChildProdigyStat(AbilityIds.Perception);
      useCharacterBurnerSpecialStore.getState().modifyChildProdigyShiftedSkill(SkillIds.Doctrine);

      const { special } = useCharacterBurnerSpecialStore.getState();
      expect(special.childProdigyShiftedSkill).toBe(SkillIds.Doctrine);
      expect(special.childProdigyStat).toBeUndefined();
    });
  });

  describe("modifyDarlingOfCourtResource / modifyEarToGroundResource / modifyLordOfAgesResource", () => {
    it("sets darlingOfCourtResource", () => {
      useCharacterBurnerSpecialStore.getState().modifyDarlingOfCourtResource("key-1");
      expect(useCharacterBurnerSpecialStore.getState().special.darlingOfCourtResource).toBe("key-1");
    });

    it("sets earToGroundResource", () => {
      useCharacterBurnerSpecialStore.getState().modifyEarToGroundResource("key-2");
      expect(useCharacterBurnerSpecialStore.getState().special.earToGroundResource).toBe("key-2");
    });

    it("sets lordOfAgesResource", () => {
      useCharacterBurnerSpecialStore.getState().modifyLordOfAgesResource("key-3");
      expect(useCharacterBurnerSpecialStore.getState().special.lordOfAgesResource).toBe("key-3");
    });
  });

  describe("modifyFeyBloodTrait", () => {
    it("adds the new trait as a general trait", () => {
      const trait = useRulesetStore.getState().getTrait(TraitIds.Stoic);
      useCharacterBurnerSpecialStore.getState().modifyFeyBloodTrait(trait);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toBeDefined();
      expect(useCharacterBurnerSpecialStore.getState().special.feyBloodTrait).toBe(TraitIds.Stoic);
    });

    it("removes the previous trait before adding a new one", () => {
      const stoic = useRulesetStore.getState().getTrait(TraitIds.Stoic);
      const heirloom = useRulesetStore.getState().getTrait(TraitIds.FamilyHeirloomGranter);
      useCharacterBurnerSpecialStore.getState().modifyFeyBloodTrait(stoic);
      useCharacterBurnerSpecialStore.getState().modifyFeyBloodTrait(heirloom);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toBeUndefined();
      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.FamilyHeirloomGranter)).toBeDefined();
    });

    it("BUG: does not add a trait whose id is 0, since addGeneralTrait's guard `if (!trait.id) return` treats id 0 as falsy/missing", () => {
      // Faithful's fixture id is 0 (a real, valid trait id -- 0 is a legitimate id value per
      // dat.TraitId's `Nominal<number, ...>` typing). useCharacterBurnerTrait.tsx's addGeneralTrait
      // guards with `if (!trait.id) return;`, which incorrectly treats id 0 the same as a missing
      // (null) id, silently dropping the trait instead of adding it. Documented here as observed
      // behavior, not fixed.
      const faithful = useRulesetStore.getState().getTrait(TraitIds.Faithful);
      useCharacterBurnerSpecialStore.getState().modifyFeyBloodTrait(faithful);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Faithful)).toBeUndefined();
      // The special.feyBloodTrait bookkeeping is set regardless, since that assignment doesn't share
      // addGeneralTrait's guard -- so special/trait state can drift out of sync when id is 0.
      expect(useCharacterBurnerSpecialStore.getState().special.feyBloodTrait).toBe(TraitIds.Faithful);
    });

    it("clears feyBloodTrait when passed undefined, removing the general trait", () => {
      const trait = useRulesetStore.getState().getTrait(TraitIds.Stoic);
      useCharacterBurnerSpecialStore.getState().modifyFeyBloodTrait(trait);

      useCharacterBurnerSpecialStore.getState().modifyFeyBloodTrait(undefined);

      expect(useCharacterBurnerSpecialStore.getState().special.feyBloodTrait).toBeUndefined();
      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toBeUndefined();
    });
  });

  describe("modifyTaintedLegacyTrait", () => {
    it("adds the new trait as a general trait", () => {
      const trait = useRulesetStore.getState().getTrait(TraitIds.Stoic);
      useCharacterBurnerSpecialStore.getState().modifyTaintedLegacyTrait(trait);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toBeDefined();
      expect(useCharacterBurnerSpecialStore.getState().special.taintedLegacyTrait).toBe(TraitIds.Stoic);
    });

    it("removes the previous trait before adding a new one", () => {
      const stoic = useRulesetStore.getState().getTrait(TraitIds.Stoic);
      const heirloom = useRulesetStore.getState().getTrait(TraitIds.FamilyHeirloomGranter);
      useCharacterBurnerSpecialStore.getState().modifyTaintedLegacyTrait(stoic);
      useCharacterBurnerSpecialStore.getState().modifyTaintedLegacyTrait(heirloom);

      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toBeUndefined();
      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.FamilyHeirloomGranter)).toBeDefined();
    });

    it("clears taintedLegacyTrait when passed undefined, removing the general trait", () => {
      const trait = useRulesetStore.getState().getTrait(TraitIds.Stoic);
      useCharacterBurnerSpecialStore.getState().modifyTaintedLegacyTrait(trait);

      useCharacterBurnerSpecialStore.getState().modifyTaintedLegacyTrait(undefined);

      expect(useCharacterBurnerSpecialStore.getState().special.taintedLegacyTrait).toBeUndefined();
      expect(useCharacterBurnerTraitStore.getState().traits.find(TraitIds.Stoic)).toBeUndefined();
    });
  });

  describe("modifyLessonOfOneRelationship", () => {
    it("sets the relationship key and triggers updateLessonOfOne", () => {
      useCharacterBurnerSpecialStore.getState().modifyLessonOfOneRelationship("rel-1");
      expect(useCharacterBurnerSpecialStore.getState().special.lessonOfOneRelationship).toBe("rel-1");
    });
  });

  describe("modifyMournerGrief", () => {
    it("sets mournerGrief to undefined when passed undefined", () => {
      useCharacterBurnerSpecialStore.getState().modifyMournerGrief(5);
      useCharacterBurnerSpecialStore.getState().modifyMournerGrief(undefined);
      expect(useCharacterBurnerSpecialStore.getState().special.mournerGrief).toBeUndefined();
    });

    it("clamps between natural grief and 9", () => {
      useCharacterBurnerSpecialStore.getState().modifyMournerGrief(100);
      expect(useCharacterBurnerSpecialStore.getState().special.mournerGrief).toBe(9);
    });

    it("clamps up to at least the natural grief value", () => {
      const naturalGrief = useCharacterBurnerAttributeStore.getState().getNaturalGrief();
      useCharacterBurnerSpecialStore.getState().modifyMournerGrief(-100);
      expect(useCharacterBurnerSpecialStore.getState().special.mournerGrief).toBe(naturalGrief);
    });
  });

  describe("modifyServantOfCitadelQualifies / modifySwornToProtectQualifies", () => {
    it("sets servantOfCitadelQualifies and triggers updateResources", () => {
      useCharacterBurnerSpecialStore.getState().modifyServantOfCitadelQualifies(true);
      expect(useCharacterBurnerSpecialStore.getState().special.servantOfCitadelQualifies).toBe(true);
    });

    it("sets swornToProtectQualifies and triggers updateResources", () => {
      useCharacterBurnerSpecialStore.getState().modifySwornToProtectQualifies(true);
      expect(useCharacterBurnerSpecialStore.getState().special.swornToProtectQualifies).toBe(true);
    });
  });

  describe("addBrutalLifeTrait / setHuntingGround", () => {
    it("appends a brutal life trait entry", () => {
      useCharacterBurnerSpecialStore.getState().addBrutalLifeTrait([TraitIds.Stoic, "Stoic"]);
      expect(useCharacterBurnerSpecialStore.getState().special.stock.brutalLifeTraits).toEqual([[TraitIds.Stoic, "Stoic"]]);
    });

    it("appends multiple brutal life trait entries across calls", () => {
      useCharacterBurnerSpecialStore.getState().addBrutalLifeTrait("No Trait");
      useCharacterBurnerSpecialStore.getState().addBrutalLifeTrait([TraitIds.Stoic, "Stoic"]);
      expect(useCharacterBurnerSpecialStore.getState().special.stock.brutalLifeTraits).toEqual(["No Trait", [TraitIds.Stoic, "Stoic"]]);
    });

    it("sets the hunting ground", () => {
      useCharacterBurnerSpecialStore.getState().setHuntingGround("Plentiful");
      expect(useCharacterBurnerSpecialStore.getState().special.stock.huntingGround).toBe("Plentiful");
    });
  });

  describe("switchQuestion", () => {
    it("toggles a question's answer", () => {
      useCharacterBurnerSpecialStore.setState({ questions: [{ id: 0 as dat.QuestionId, name: "Q", question: "?", answer: false }] });
      useCharacterBurnerSpecialStore.getState().switchQuestion(0 as dat.QuestionId);
      expect(useCharacterBurnerSpecialStore.getState().questions[0].answer).toBe(true);

      useCharacterBurnerSpecialStore.getState().switchQuestion(0 as dat.QuestionId);
      expect(useCharacterBurnerSpecialStore.getState().questions[0].answer).toBe(false);
    });
  });

  describe("refreshQuestions", () => {
    it("includes ungated questions unconditionally", () => {
      useCharacterBurnerSpecialStore.getState().refreshQuestions();
      const names = useCharacterBurnerSpecialStore.getState().questions.map(q => q.name);
      expect(names).toContain("UNGATED");
    });

    it("excludes attribute-gated questions when the attribute is not present", () => {
      useCharacterBurnerAttributeStore.setState({ attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>() });
      useCharacterBurnerSpecialStore.getState().refreshQuestions();
      const names = useCharacterBurnerSpecialStore.getState().questions.map(q => q.name);
      expect(names).not.toContain("GATED");
    });

    it("includes attribute-gated questions when the attribute is present", () => {
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Faith, name: "Faith", hasShade: true, shadeShifted: false, exponent: 3 }])
      });
      useCharacterBurnerSpecialStore.getState().refreshQuestions();
      const names = useCharacterBurnerSpecialStore.getState().questions.map(q => q.name);
      expect(names).toContain("GATED");
    });

    it("preserves an existing answer across a refresh", () => {
      useCharacterBurnerSpecialStore.getState().refreshQuestions();
      const ungatedId = useCharacterBurnerSpecialStore.getState().questions.find(q => q.name === "UNGATED")?.id;
      if (ungatedId !== undefined) useCharacterBurnerSpecialStore.getState().switchQuestion(ungatedId);

      useCharacterBurnerSpecialStore.getState().refreshQuestions();

      const ungated = useCharacterBurnerSpecialStore.getState().questions.find(q => q.name === "UNGATED");
      expect(ungated?.answer).toBe(true);
    });

    it("defaults a newly-appearing question's answer to false", () => {
      useCharacterBurnerSpecialStore.setState({ questions: [] });
      useCharacterBurnerSpecialStore.getState().refreshQuestions();

      const ungated = useCharacterBurnerSpecialStore.getState().questions.find(q => q.name === "UNGATED");
      expect(ungated?.answer).toBe(false);
    });

    it("filters out a question missing id/name/question", () => {
      useRulesetStore.setState({ questions: [...useRulesetStore.getState().questions, { id: null, name: "Bad", question: "?" }] });
      useCharacterBurnerSpecialStore.getState().refreshQuestions();
      const names = useCharacterBurnerSpecialStore.getState().questions.map(q => q.name);
      expect(names).not.toContain("Bad");
    });

    it("includes a two-attribute-gated question when either of its two attributes is present", () => {
      const twoAttrId = 99 as dat.QuestionId;
      useRulesetStore.setState({
        questions: [...useRulesetStore.getState().questions, { id: twoAttrId, name: "TWO_ATTR", question: "?", attributes: [[AbilityIds.Faith, "Faith"], [AbilityIds.Steel, "Steel"]] }]
      });
      useCharacterBurnerAttributeStore.setState({
        attributes: new UniqueArray<dat.AbilityId, CharacterAttribute>([{ id: AbilityIds.Steel, name: "Steel", hasShade: false, shadeShifted: false, exponent: 3 }])
      });

      useCharacterBurnerSpecialStore.getState().refreshQuestions();

      const names = useCharacterBurnerSpecialStore.getState().questions.map(q => q.name);
      expect(names).toContain("TWO_ATTR");
    });

    it("BUG: drops a question whose real id is 0, since the guard `if (!v.id || ...) return false` treats id 0 as falsy/missing", () => {
      // dat.QuestionId 0 is a legitimate id (Nominal<number, ...> has no reserved sentinel value), but
      // refreshQuestions's `!v.id` check can't distinguish "id is 0" from "id is null/undefined" --
      // so a question with a real id of 0 is silently excluded from the character's question list
      // entirely, the same falsy-zero-id class of bug also seen in addGeneralTrait. Documented here as
      // observed behavior, not fixed.
      expect(QuestionIds.ZeroId).toBe(0);
      useCharacterBurnerSpecialStore.getState().refreshQuestions();
      const names = useCharacterBurnerSpecialStore.getState().questions.map(q => q.name);
      expect(names).not.toContain("ZEROID");
    });
  });

  describe("hasQuestionTrue / hasQuestionTrueByName", () => {
    it("hasQuestionTrue is true only for an answered-true question with matching id", () => {
      useCharacterBurnerSpecialStore.setState({ questions: [{ id: 5 as dat.QuestionId, name: "Q", question: "?", answer: true }] });
      expect(useCharacterBurnerSpecialStore.getState().hasQuestionTrue(5 as dat.QuestionId)).toBe(true);
      expect(useCharacterBurnerSpecialStore.getState().hasQuestionTrue(6 as dat.QuestionId)).toBe(false);
    });

    it("hasQuestionTrueByName matches by name", () => {
      useCharacterBurnerSpecialStore.setState({ questions: [{ id: 5 as dat.QuestionId, name: "Q", question: "?", answer: true }] });
      expect(useCharacterBurnerSpecialStore.getState().hasQuestionTrueByName("Q")).toBe(true);
      expect(useCharacterBurnerSpecialStore.getState().hasQuestionTrueByName("Other")).toBe(false);
    });
  });
});
