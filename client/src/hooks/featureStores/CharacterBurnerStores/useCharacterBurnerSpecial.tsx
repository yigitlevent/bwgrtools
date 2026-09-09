import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CreateInitialSpecial } from "./createInitialSpecial";
import { RecomputeCharacter } from "./recomputeCharacter";
import { RefreshCharacterLimits } from "./refreshCharacterLimits";
import { useCharacterBurnerAttributeStore } from "./useCharacterBurnerAttribute";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { Clamp } from "../../../utils/Clamp";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerSpecialState {
  special: CharacterSpecial;
  questions: CharacterQuestion[];

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
}

export const useCharacterBurnerSpecialStore = create<CharacterBurnerSpecialState>()(
  devtools(
    (set, get) => ({
      special: CreateInitialSpecial(),

      questions: [],

      reset: (): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special = CreateInitialSpecial();
          state.questions = [];
        }));
      },

      modifyCompanionLifepath: (companionName: string, companionLifepathId: dat.LifepathId): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.companionLifepath[companionName] = companionLifepathId;
        }));

        RecomputeCharacter("skillTrait");
      },

      modifyVariableAge: (lifepathId: dat.LifepathId, age: number, minmax: number[]): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.variableAge[lifepathId] = Clamp(age, minmax[0], minmax[1]);
        }));
      },

      modifyCompanionSkills: (companionLifepathId: dat.LifepathId, skills: dat.SkillId[] | undefined): void => {
        if (skills !== undefined) {
          set(produce<CharacterBurnerSpecialState>(state => {
            state.special.companionSkills[companionLifepathId] = skills;
          }));

          RecomputeCharacter("skillTrait");
        }
      },

      modifySkillSubskills: (skillId: dat.SkillId, subskillIds: dat.SkillId[] | null, canSelectMultiple: boolean): void => {
        const prev = get().special.chosenSubskills[skillId];

        if (canSelectMultiple && subskillIds !== null) {
          set(produce<CharacterBurnerSpecialState>(state => {
            state.special.chosenSubskills[skillId] = [...subskillIds];
          }));
        }
        else {
          set(produce<CharacterBurnerSpecialState>(state => {
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

          set(produce<CharacterBurnerSpecialState>(state => {
            state.special.chosenSubskills[skillId] = [];
          }));
        }
        );
      },

      modifyChosenResourceType: (traitId: dat.TraitId, resourceTypeId: dat.ResourceTypeId): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.chosenResourceType[traitId] = resourceTypeId;
        }));

        useCharacterBurnerResourceStore.getState().updateResources();
      },

      modifyAvariceGreed: (greed: number | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
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
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.crippledStat = stat;
        }));

        RefreshCharacterLimits();
      },

      modifyFrailStat: (stat: dat.AbilityId | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.frailStat = stat;
        }));

        RefreshCharacterLimits();
      },

      modifyMissingLimb: (limb: dat.AbilityId | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.missingLimb = limb;
        }));

        RefreshCharacterLimits();
      },

      modifyChildProdigyStat: (stat: dat.AbilityId | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.childProdigyStat = stat;
          state.special.childProdigyShiftedSkill = undefined;
        }));
      },

      modifyChildProdigyShiftedSkill: (skillId: dat.SkillId | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.childProdigyShiftedSkill = skillId;
          state.special.childProdigyStat = undefined;
        }));
      },

      modifyDarlingOfCourtResource: (resourceKey: string | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.darlingOfCourtResource = resourceKey;
        }));
      },

      modifyEarToGroundResource: (resourceKey: string | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.earToGroundResource = resourceKey;
        }));
      },

      modifyFeyBloodTrait: (trait: Trait | undefined): void => {
        const { special } = get();
        const { addGeneralTrait, removeGeneralTrait } = useCharacterBurnerTraitStore.getState();

        if (special.feyBloodTrait !== undefined) removeGeneralTrait(special.feyBloodTrait);
        if (trait !== undefined && trait.id !== null) addGeneralTrait(trait);

        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.feyBloodTrait = trait?.id ?? undefined;
        }));
      },

      modifyLessonOfOneRelationship: (resourceKey: string | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.lessonOfOneRelationship = resourceKey;
        }));

        useCharacterBurnerResourceStore.getState().updateLessonOfOne();
      },

      modifyLordOfAgesResource: (resourceKey: string | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.lordOfAgesResource = resourceKey;
        }));
      },

      modifyMournerGrief: (grief: number | undefined): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          if (grief === undefined) {
            state.special.mournerGrief = undefined;
            return;
          }

          const { getNaturalGrief } = useCharacterBurnerAttributeStore.getState();
          state.special.mournerGrief = Clamp(grief, getNaturalGrief(), 9);
        }));
      },

      modifyServantOfCitadelQualifies: (qualifies: boolean): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.servantOfCitadelQualifies = qualifies;
        }));

        useCharacterBurnerResourceStore.getState().updateResources();
      },

      modifySwornToProtectQualifies: (qualifies: boolean): void => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.swornToProtectQualifies = qualifies;
        }));

        useCharacterBurnerResourceStore.getState().updateResources();
      },

      modifyTaintedLegacyTrait: (trait: Trait | undefined): void => {
        const { special } = get();
        const { addGeneralTrait, removeGeneralTrait } = useCharacterBurnerTraitStore.getState();

        if (special.taintedLegacyTrait !== undefined) removeGeneralTrait(special.taintedLegacyTrait);
        if (trait !== undefined && trait.id !== null) addGeneralTrait(trait);

        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.taintedLegacyTrait = trait?.id ?? undefined;
        }));
      },

      addBrutalLifeTrait: (traitId: [id: dat.TraitId, name: string] | "No Trait") => {
        set(produce<CharacterBurnerSpecialState>(state => {
          const prev = state.special.stock.brutalLifeTraits;
          state.special.stock.brutalLifeTraits = [...prev, traitId];
        }));
      },

      setHuntingGround: (huntingGround: HuntingGroundsList) => {
        set(produce<CharacterBurnerSpecialState>(state => {
          state.special.stock.huntingGround = huntingGround;
        }));
      },

      switchQuestion: (id: dat.QuestionId): void => {
        const index = get().questions.findIndex(v => v.id === id);

        set(produce<CharacterBurnerSpecialState>(state => {
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
              if (v.id === null || v.name === null || v.question === null) return false;

              const attrIds = [];
              if (v.attributes?.[0]?.[0] !== undefined) attrIds.push(v.attributes[0][0]);
              if (v.attributes?.[1]?.[0] !== undefined) attrIds.push(v.attributes[1][0]);
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

        set(produce<CharacterBurnerSpecialState>(state => {
          state.questions = newQuestions;
        }));
      },

      hasQuestionTrue: (id: dat.QuestionId): boolean => {
        return get().questions.some(v => v.id === id && v.answer);
      },

      hasQuestionTrueByName: (name: string): boolean => {
        return get().questions.some(v => v.name === name && v.answer);
      }
    }),
    { name: "useCharacterBurnerSpecialStore" }
  )
);
