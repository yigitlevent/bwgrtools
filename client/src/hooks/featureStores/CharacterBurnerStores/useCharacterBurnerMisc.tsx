import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { RecomputeCharacter } from "./recomputeCharacter";
import { useCharacterBurnerAttributeStore } from "./useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { Average } from "../../../utils/Average";
import { Clamp } from "../../../utils/Clamp";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerMiscState {
  special: CharacterSpecial;
  questions: CharacterQuestion[];
  limits: CharacterStockLimits;
  traitEffects: CharacterTraitEffect[];

  reset: () => void;

  modifyCompanionLifepath: (companionName: string, companionLifepathId: dat.LifepathId) => void;
  modifyVariableAge: (lifepathId: dat.LifepathId, age: number, minmax: number[]) => void;
  modifyCompanionSkills: (companionLifepathId: dat.LifepathId, skills: dat.SkillId[] | undefined) => void;
  modifySkillSubskills: (skillId: dat.SkillId, subskillIds: dat.SkillId[] | null, canSelectMultiple: boolean) => void;
  resetSkillSubskills: (skillIds: dat.SkillId[]) => void;

  addBrutalLifeTrait: (traitId: [id: dat.TraitId, name: string] | "No Trait") => void;
  setHuntingGround: (huntingGround: HuntingGroundsList) => void;

  switchQuestion: (id: dat.QuestionId) => void;
  refreshQuestions: () => void;
  hasQuestionTrue: (id: dat.QuestionId) => boolean;
  hasQuestionTrueByName: (name: string) => boolean;

  getTolerances: () => string[];
  refreshTraitEffects: () => void;
}

export const useCharacterBurnerMiscStore = create<CharacterBurnerMiscState>()(
  devtools(
    (set, get) => ({
      special: {
        stock: { brutalLifeTraits: [], huntingGround: undefined },
        companionLifepath: {},
        variableAge: {},
        companionSkills: {},
        chosenSubskills: {}
      },

      questions: [],

      traitEffects: [],

      limits: {
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
      },

      reset: (): void => {
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();

        // TODO: stock-related ability limits are incomplete. Stat exponent caps are handled below
        // (Elf/Great Wolf/Troll), but belief count, instinct count, and skill exponent caps have no
        // trait-based overrides yet -- CharacterStockLimits (shared/@types/character.d.ts) doesn't
        // even have a `skills` field yet, so that needs a type change too, not just logic here.
        const limits: CharacterStockLimits = {
          beliefs: 3, // TODO: trait-based belief limit
          instincts: 3, // TODO: trait-based instinct limit
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

        if (stock[1] === "Elf") {
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
        }

        set(produce<CharacterBurnerMiscState>(state => {
          state.special = {
            stock: { brutalLifeTraits: [], huntingGround: undefined },
            companionLifepath: {},
            variableAge: {},
            companionSkills: {},
            chosenSubskills: {}
          };
          state.questions = [];
          state.traitEffects = [];
          state.limits = limits;
        }));

        get().refreshTraitEffects();
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

      refreshTraitEffects: () => {
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();

        set(produce<CharacterBurnerMiscState>(state => {
          state.traitEffects = [];

          // TODO: The ruleset has ~544 Call-on/Die traits and ~125 Monstrous traits; there's no
          // generic rule for deriving their mechanical effect from type/category alone, so each one
          // needs its own case added here as it's needed, following the pattern below (Tough).
          // This also needs to cover traits that grant free resources (e.g. a trait that grants a
          // free reputation/relationship), not just numeric calculation effects like Tough's --
          // that's a new kind of CharacterTraitEffect (or a separate resource-granting mechanism,
          // see the "auto resources from traits list" TODO in useCharacterBurnerResource.tsx).
          // Go through traits stock by stock rather than trying to do all ~670 at once:
          //   - Dwarf traits
          //   - Elf traits (including Dark Elf)
          //   - Human traits
          //   - Orc traits
          //   - Roden traits
          //   - Great Wolf traits
          //   - Troll traits
          //   - General call-on traits
          //   - General die traits
          //   - Monstrous traits
          if (hasTraitOpenByName("Tough")) state.traitEffects.push({ roundUp: "Mortal Wound" });
        }));
      },

      getTolerances: (): string[] => {
        const { getStat } = useCharacterBurnerStatStore.getState();
        const { traitEffects } = get();

        const power = getStat("Power");
        const forte = getStat("Forte");

        const ptgs = Array(16).fill("—") as string[];

        const maxDistance = Math.ceil(forte.exponent / 2);

        const mortalWound =
          traitEffects.some(x => "roundUp" in x && x.roundUp === "Mortal Wound") ? Math.ceil(Average([power.exponent, forte.exponent])) + 6 : Math.floor(Average([power.exponent, forte.exponent])) + 6;

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
