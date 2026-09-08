import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { RecomputeCharacter } from "./recomputeCharacter";
import { useCharacterBurnerAttributeStore } from "./useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { Average } from "../../../utils/Average";
import { Clamp } from "../../../utils/Clamp";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerMiscState {
  special: CharacterSpecial;
  questions: CharacterQuestion[];
  limits: CharacterStockLimits;

  reset: () => void;

  modifyCompanionLifepath: (companionName: string, companionLifepathId: dat.LifepathId) => void;
  modifyVariableAge: (lifepathId: dat.LifepathId, age: number, minmax: number[]) => void;
  modifyCompanionSkills: (companionLifepathId: dat.LifepathId, skills: dat.SkillId[] | undefined) => void;
  modifySkillSubskills: (skillId: dat.SkillId, subskillIds: dat.SkillId[] | null, canSelectMultiple: boolean) => void;
  resetSkillSubskills: (skillIds: dat.SkillId[]) => void;
  modifyChosenResourceType: (traitId: dat.TraitId, resourceTypeId: dat.ResourceTypeId) => void;
  modifyAvariceGreed: (greed: number | undefined) => void;
  modifyCrippledStat: (stat: dat.AbilityId | undefined) => void;
  modifyFrailStat: (stat: dat.AbilityId | undefined) => void;
  modifyMissingLimb: (limb: dat.AbilityId | undefined) => void;
  modifyChildProdigyStat: (stat: dat.AbilityId | undefined) => void;
  modifyChildProdigyShiftedSkill: (skillId: dat.SkillId | undefined) => void;
  modifyDarlingOfCourtResource: (resourceKey: string | undefined) => void;
  modifyEarToGroundResource: (resourceKey: string | undefined) => void;
  modifyFeyBloodTrait: (trait: Trait | undefined) => void;
  modifyLessonOfOneRelationship: (resourceKey: string | undefined) => void;
  modifyLordOfAgesResource: (resourceKey: string | undefined) => void;
  modifyMournerGrief: (grief: number | undefined) => void;
  modifyServantOfCitadelQualifies: (qualifies: boolean) => void;
  modifySwornToProtectQualifies: (qualifies: boolean) => void;
  modifyTaintedLegacyTrait: (trait: Trait | undefined) => void;

  addBrutalLifeTrait: (traitId: [id: dat.TraitId, name: string] | "No Trait") => void;
  setHuntingGround: (huntingGround: HuntingGroundsList) => void;

  switchQuestion: (id: dat.QuestionId) => void;
  refreshQuestions: () => void;
  hasQuestionTrue: (id: dat.QuestionId) => boolean;
  hasQuestionTrueByName: (name: string) => boolean;

  getTolerances: () => string[];
  refreshLimits: () => void;
}

function CreateInitialSpecial(): CharacterSpecial {
  return {
    stock: { brutalLifeTraits: [], huntingGround: undefined },
    companionLifepath: {},
    variableAge: {},
    companionSkills: {},
    chosenSubskills: {},
    chosenResourceType: {},
    avariceGreed: undefined,
    crippledStat: undefined,
    frailStat: undefined,
    missingLimb: undefined,
    childProdigyStat: undefined,
    childProdigyShiftedSkill: undefined,
    darlingOfCourtResource: undefined,
    earToGroundResource: undefined,
    feyBloodTrait: undefined,
    lessonOfOneRelationship: undefined,
    lordOfAgesResource: undefined,
    mournerGrief: undefined,
    servantOfCitadelQualifies: false,
    swornToProtectQualifies: false,
    taintedLegacyTrait: undefined
  };
}

function CreateDefaultLimits(): CharacterStockLimits {
  return {
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
  };
}

export const useCharacterBurnerMiscStore = create<CharacterBurnerMiscState>()(
  devtools(
    (set, get) => ({
      special: CreateInitialSpecial(),

      questions: [],

      limits: CreateDefaultLimits(),

      reset: (): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special = CreateInitialSpecial();
          state.questions = [];
        }));

        get().refreshLimits();
      },

      modifyCompanionLifepath: (companionName: string, companionLifepathId: dat.LifepathId): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.companionLifepath[companionName] = companionLifepathId;
        }));

        RecomputeCharacter("skillTrait");
      },

      modifyVariableAge: (lifepathId: dat.LifepathId, age: number, minmax: number[]): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.variableAge[lifepathId] = Clamp(age, minmax[0], minmax[1]);
        }));
      },

      modifyCompanionSkills: (companionLifepathId: dat.LifepathId, skills: dat.SkillId[] | undefined): void => {
        if (skills) {
          set(produce<CharacterBurnerMiscState>(state => {
            state.special.companionSkills[companionLifepathId] = skills;
          }));

          RecomputeCharacter("skillTrait");
        }
      },

      modifySkillSubskills: (skillId: dat.SkillId, subskillIds: dat.SkillId[] | null, canSelectMultiple: boolean): void => {
        const prev = get().special.chosenSubskills[skillId];

        if (canSelectMultiple && subskillIds) {
          set(produce<CharacterBurnerMiscState>(state => {
            state.special.chosenSubskills[skillId] = [...subskillIds];
          }));
        }
        else {
          set(produce<CharacterBurnerMiscState>(state => {
            if (subskillIds === null) state.special.chosenSubskills[skillId] = [];
            else if (prev.includes(subskillIds[0])) state.special.chosenSubskills[skillId] = [];
            else state.special.chosenSubskills[skillId] = [subskillIds[0]];
          }));
        }

        RecomputeCharacter("skillTrait");
      },

      resetSkillSubskills: (skillIds: dat.SkillId[]): void => {
        const { chosenSubskills } = get().special;

        skillIds.forEach(skillId => {
          if (skillId in chosenSubskills) return;

          set(produce<CharacterBurnerMiscState>(state => {
            state.special.chosenSubskills[skillId] = [];
          }));
        }
        );
      },

      modifyChosenResourceType: (traitId: dat.TraitId, resourceTypeId: dat.ResourceTypeId): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.chosenResourceType[traitId] = resourceTypeId;
        }));

        useCharacterBurnerResourceStore.getState().updateResources();
      },

      modifyAvariceGreed: (greed: number | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          if (greed === undefined) {
            state.special.avariceGreed = undefined;
            return;
          }

          const { getNaturalGreed } = useCharacterBurnerAttributeStore.getState();
          const minGreed = getNaturalGreed() + 1;
          state.special.avariceGreed = Math.max(greed, minGreed);
        }));
      },

      modifyCrippledStat: (stat: dat.AbilityId | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.crippledStat = stat;
        }));

        get().refreshLimits();
      },

      modifyFrailStat: (stat: dat.AbilityId | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.frailStat = stat;
        }));

        get().refreshLimits();
      },

      modifyMissingLimb: (limb: dat.AbilityId | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.missingLimb = limb;
        }));

        get().refreshLimits();
      },

      modifyChildProdigyStat: (stat: dat.AbilityId | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.childProdigyStat = stat;
          state.special.childProdigyShiftedSkill = undefined;
        }));
      },

      modifyChildProdigyShiftedSkill: (skillId: dat.SkillId | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.childProdigyShiftedSkill = skillId;
          state.special.childProdigyStat = undefined;
        }));
      },

      modifyDarlingOfCourtResource: (resourceKey: string | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.darlingOfCourtResource = resourceKey;
        }));
      },

      modifyEarToGroundResource: (resourceKey: string | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.earToGroundResource = resourceKey;
        }));
      },

      modifyFeyBloodTrait: (trait: Trait | undefined): void => {
        const { special } = get();
        const { addGeneralTrait, removeGeneralTrait } = useCharacterBurnerTraitStore.getState();

        if (special.feyBloodTrait !== undefined) removeGeneralTrait(special.feyBloodTrait);
        if (trait?.id) addGeneralTrait(trait);

        set(produce<CharacterBurnerMiscState>(state => {
          state.special.feyBloodTrait = trait?.id ?? undefined;
        }));
      },

      modifyLessonOfOneRelationship: (resourceKey: string | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.lessonOfOneRelationship = resourceKey;
        }));

        useCharacterBurnerResourceStore.getState().updateLessonOfOne();
      },

      modifyLordOfAgesResource: (resourceKey: string | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.lordOfAgesResource = resourceKey;
        }));
      },

      modifyMournerGrief: (grief: number | undefined): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          if (grief === undefined) {
            state.special.mournerGrief = undefined;
            return;
          }

          const { getNaturalGrief } = useCharacterBurnerAttributeStore.getState();
          state.special.mournerGrief = Clamp(grief, getNaturalGrief(), 9);
        }));
      },

      modifyServantOfCitadelQualifies: (qualifies: boolean): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.servantOfCitadelQualifies = qualifies;
        }));

        useCharacterBurnerResourceStore.getState().updateResources();
      },

      modifySwornToProtectQualifies: (qualifies: boolean): void => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.swornToProtectQualifies = qualifies;
        }));

        useCharacterBurnerResourceStore.getState().updateResources();
      },

      modifyTaintedLegacyTrait: (trait: Trait | undefined): void => {
        const { special } = get();
        const { addGeneralTrait, removeGeneralTrait } = useCharacterBurnerTraitStore.getState();

        if (special.taintedLegacyTrait !== undefined) removeGeneralTrait(special.taintedLegacyTrait);
        if (trait?.id) addGeneralTrait(trait);

        set(produce<CharacterBurnerMiscState>(state => {
          state.special.taintedLegacyTrait = trait?.id ?? undefined;
        }));
      },

      addBrutalLifeTrait: (traitId: [id: dat.TraitId, name: string] | "No Trait") => {
        set(produce<CharacterBurnerMiscState>(state => {
          const prev = state.special.stock.brutalLifeTraits;
          state.special.stock.brutalLifeTraits = [...prev, traitId];
        }));
      },

      setHuntingGround: (huntingGround: HuntingGroundsList) => {
        set(produce<CharacterBurnerMiscState>(state => {
          state.special.stock.huntingGround = huntingGround;
        }));
      },

      switchQuestion: (id: dat.QuestionId): void => {
        const index = get().questions.findIndex(v => v.id === id);

        set(produce<CharacterBurnerMiscState>(state => {
          const prev = state.questions[index];
          state.questions[index] = { ...prev, answer: !prev.answer };
        }));
      },

      refreshQuestions: () => {
        const ruleset = useRulesetStore.getState();
        const { hasAttribute } = useCharacterBurnerAttributeStore.getState();
        const { questions } = get();

        const newQuestions: CharacterQuestion[] =
          ruleset.questions
            .filter((v): v is Question & { id: dat.QuestionId; name: string; question: string; } => {
              if (!v.id || !v.name || !v.question) return false;

              const attrIds = [];
              if (v.attributes?.[0]?.[0]) attrIds.push(v.attributes[0][0]);
              if (v.attributes?.[1]?.[0]) attrIds.push(v.attributes[1][0]);
              if (attrIds.length === 0) return true;
              else if (attrIds.length > 0 && attrIds.some(a => hasAttribute(a))) return true;
              else return false;
            })
            .map(question => {
              const idx = questions.findIndex(v => v.id === question.id);
              return {
                id: question.id,
                name: question.name,
                question: question.question,
                answer: (idx > -1) ? questions[idx].answer : false
              };
            });

        set(produce<CharacterBurnerMiscState>(state => {
          state.questions = newQuestions;
        }));
      },

      hasQuestionTrue: (id: dat.QuestionId): boolean => {
        return get().questions.some(v => v.id === id && v.answer);
      },

      hasQuestionTrueByName: (name: string): boolean => {
        return get().questions.some(v => v.name === name && v.answer);
      },

      refreshLimits: (): void => {
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();

        const limits: CharacterStockLimits = CreateDefaultLimits();

        if (stock[1] === "Dwarf") {
          if (hasTraitOpenByName("Stout")) {
            const { getStat } = useCharacterBurnerStatStore.getState();
            limits.stats.Forte = { min: 1, max: 9 };
            // Speed must always be lower than the higher of Power/Forte, on top of its own flat cap.
            const higherOfPowerForte = Math.max(getStat("Power").exponent, getStat("Forte").exponent);
            limits.stats.Speed = { min: 1, max: Math.max(1, Math.min(6, higherOfPowerForte - 1)) };
          }
        }
        else if (stock[1] === "Elf") {
          if (hasTraitOpenByName("First Born")) limits.stats.Perception = { min: 1, max: 9 };
        }
        else if (stock[1] === "Great Wolf") {
          if (hasTraitOpenByName("Great Lupine Form")) limits.stats.Agility = { min: 1, max: 6 };
        }
        else if (stock[1] === "Troll") {
          if (hasTraitOpenByName("Massive Stature")) {
            limits.stats.Power = { min: 4, max: 9 };
            limits.stats.Forte = { min: 4, max: 9 };
            limits.stats.Agility = { min: 1, max: 5 };
            limits.stats.Speed = { min: 1, max: 5 };
          }
          if (hasTraitOpenByName("Stone's Age")) {
            limits.stats.Perception = { min: 1, max: 6 };
            limits.stats.Will = { min: 1, max: 6 };
          }
        }

        // Traits granting an additional (4th) Belief or Instinct -- verified against each trait's
        // actual description text. "Possessed" also grants an extra BIT set but for a separate
        // possessing spirit (not a 4th slot on the character's own sheet), so it's out of scope here.
        if (["Loyal", "Oathsworn", "Sworn to the Order", "Zealot", "Noblesse Oblige"].some(name => hasTraitOpenByName(name))) limits.beliefs = 4;
        if (hasTraitOpenByName("Alarmist")) limits.instincts = 4;

        const ruleset = useRulesetStore.getState();
        const { special } = get();

        // Crippled: player-chosen stat capped at exponent 4 (the "cannot start higher than 3" half
        // of the rule isn't representable -- the burner has no starting-vs-advancement distinction).
        if (hasTraitOpenByName("Crippled") && special.crippledStat !== undefined) {
          const statName = ruleset.getAbility(special.crippledStat).name;
          if (statName) limits.stats[statName] = { min: 1, max: 4 };
        }

        // Frail: player-chosen stat (Power or Forte) capped at exponent 5.
        if (hasTraitOpenByName("Frail") && special.frailStat !== undefined) {
          const statName = ruleset.getAbility(special.frailStat).name;
          if (statName) limits.stats[statName] = { min: 1, max: 5 };
        }

        // Missing Limb: a missing arm caps Agility at 5; a missing leg caps Speed at 4 (stride is
        // handled in GetStride, not here).
        if (hasTraitOpenByName("Missing Limb") && special.missingLimb !== undefined) {
          const limbName = ruleset.getAbility(special.missingLimb).name;
          if (limbName === "Agility") limits.stats.Agility = { min: 1, max: 5 };
          else if (limbName === "Speed") limits.stats.Speed = { min: 1, max: 4 };
        }

        set(produce<CharacterBurnerMiscState>(state => {
          state.limits = limits;
        }));
      },

      getTolerances: (): string[] => {
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();

        const power = getStat("Power");
        const forte = getStat("Forte");

        const ptgs = Array(16).fill("—") as string[];

        const maxDistance = Math.ceil(forte.exponent / 2);

        const mortalWound =
          hasTraitOpenByName("Tough") ? Math.ceil(Average([power.exponent, forte.exponent])) + 6 : Math.floor(Average([power.exponent, forte.exponent])) + 6;

        let traumatic = mortalWound - 1;
        let severe = mortalWound - 2;
        let midi = mortalWound - 3;
        let light = mortalWound - 4;
        const superficial = Math.floor(forte.exponent / 2) + 1;

        while (light - superficial > maxDistance) light--;
        while (midi - light > maxDistance) midi--;
        while (severe - midi > maxDistance) severe--;
        while (traumatic - severe > maxDistance) traumatic--;

        for (let i = 0; i < ptgs.length; i++) {
          if (i >= superficial && i < light) ptgs[i] = "Su";
          else if (i >= light && i < midi) ptgs[i] = "Li";
          else if (i >= midi && i < severe) ptgs[i] = "Mi";
          else if (i >= severe && i < traumatic) ptgs[i] = "Se";
          else if (i >= traumatic && i < mortalWound) ptgs[i] = "Tr";
          else if (i === mortalWound) ptgs[i] = "MW";
        }

        return ptgs;
      }
    }),
    { name: "useCharacterBurnerMiscStore" }
  )
);
