import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { RefreshCharacterLimits } from "./refreshCharacterLimits";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { GetLifepathOccurrences } from "../../../utils/GetLifepathOccurrences";
import { UniqueArray } from "../../../utils/UniqueArray";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerTraitState {
  traits: UniqueArray<dat.TraitId, CharacterTrait>;

  reset: () => void;

  openTrait: (traitId: dat.TraitId) => void;
  addGeneralTrait: (trait: Trait) => void;
  removeGeneralTrait: (traitId: dat.TraitId) => void;

  getTraitPools: (lifepaths?: Lifepath[]) => Points;
  getTrait: (traitId: dat.TraitId) => { open: boolean; };

  hasTraitOpen: (id: dat.TraitId) => boolean;
  hasTraitOpenByName: (name: string) => boolean;

  /**
   * Updates the character's traits list.
   * It preserves the common traits, and re-adds previously selected general traits, if they are not present in the lifepath trait list.
   * Applies the Law of Diminishing Returns for repeated lifepaths: 1st occurrence's 1st trait is
   * mandatory, 2nd occurrence's 2nd trait is mandatory (if it exists), 3rd+ occurrence grants no
   * mandatory trait from that lifepath at all.
  **/
  updateTraits: () => void;
}

export const useCharacterBurnerTraitStore = create<CharacterBurnerTraitState>()(
  devtools(
    (set, get) => ({
      traits: new UniqueArray<dat.TraitId, CharacterTrait>(),

      reset: (): void => {
        set({
          traits: new UniqueArray<dat.TraitId, CharacterTrait>()
        });
      },

      openTrait: (traitId: dat.TraitId): void => {
        const { traits, getTraitPools } = get();
        const charTrait = traits.find(traitId);

        if (charTrait && (charTrait.isOpen || getTraitPools().remaining > 0)) {
          set(produce<CharacterBurnerTraitState>(state => {
            const stateTrait = state.traits.find(traitId);
            if (stateTrait) {
              stateTrait.isOpen = !stateTrait.isOpen;
              state.traits = new UniqueArray(state.traits.add(stateTrait).items);
            }
          }));

          useCharacterBurnerResourceStore.getState().updateResources();
          useCharacterBurnerResourceStore.getState().updateLessonOfOne();
          RefreshCharacterLimits();
        }
      },

      addGeneralTrait: (trait: Trait): void => {
        if (!trait.id) return;
        const charTrait: CharacterTrait = { id: trait.id, name: trait.name ?? "", isOpen: false, type: "General" };
        set(produce<CharacterBurnerTraitState>(state => { state.traits = new UniqueArray(state.traits.add(charTrait).items); }));

        RefreshCharacterLimits();
      },

      removeGeneralTrait: (traitId: dat.TraitId): void => {
        set(produce<CharacterBurnerTraitState>(state => {
          state.traits = new UniqueArray(state.traits.remove(traitId).items);
        }));

        RefreshCharacterLimits();
      },

      getTraitPools: (lifepaths?: Lifepath[]): Points => {
        const { getTrait } = useRulesetStore.getState();
        const lps = lifepaths ?? useCharacterBurnerLifepathStore.getState().lifepaths;
        const { special } = useCharacterBurnerMiscStore.getState();
        const state = get();

        // Law of Diminishing Returns: a lifepath's trait pool contribution is lost entirely on its
        // 3rd+ occurrence, and reduced by 1 on its 2nd occurrence if it has no 2nd trait to grant.
        const occurrences = GetLifepathOccurrences(lps);
        const tTotal = lps.reduce((pv, cv, i) => {
          const occurrence = occurrences[i];
          if (occurrence >= 3) return pv;
          if (occurrence === 2 && (cv.traits?.length ?? 0) < 2) return pv + (cv.pools.traitPool ?? 0) - 1;
          return pv + (cv.pools.traitPool ?? 0);
        }, 0);
        let tSpent = 0;

        state.traits.forEach(trait => {
          if (trait.isOpen) {
            if (trait.type === "Mandatory" || trait.type === "Lifepath") tSpent += 1;
            else if (trait.type === "General") {
              // Tainted Legacy's chosen Monstrous trait is granted free.
              if (trait.id === special.taintedLegacyTrait) return;
              const rulesetTrait = getTrait(trait.id);
              tSpent += rulesetTrait.cost ?? 0;
            }
          }
        });

        return { total: tTotal, spent: tSpent, remaining: tTotal - tSpent };
      },

      getTrait: (traitId: dat.TraitId): { open: boolean; } => {
        const state = get();
        const charTrait = state.traits.find(traitId);
        const open = (charTrait && state.hasTraitOpen(traitId)) ? true : false;
        return { open };
      },

      hasTraitOpen: (id: dat.TraitId): boolean => {
        return get().traits.exists(id, "isOpen", true);
      },

      hasTraitOpenByName: (name: string): boolean => {
        return get().traits.filter(v => v.name === name).some(v => v.isOpen);
      },

      updateTraits: (): void => {
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const ruleset = useRulesetStore.getState();
        const { lifepaths } = useCharacterBurnerLifepathStore.getState();
        const state = get();

        // Law of Diminishing Returns: 1st occurrence -> 1st trait mandatory, 2nd occurrence -> 2nd
        // trait mandatory (if it exists), 3rd+ occurrence -> no mandatory trait from this lifepath.
        const occurrences = GetLifepathOccurrences(lifepaths);

        // Add Lifepath Traits
        const characterTraits = new UniqueArray<dat.TraitId, CharacterTrait>(lifepaths.map((lp, lpIndex) => {
          const occurrence = occurrences[lpIndex];
          const mandatoryIndex = occurrence <= 2 ? occurrence - 1 : -1;

          return lp.traits ? lp.traits.map((tr: dat.TraitId, i: number) => {
            const trait = ruleset.getTrait(tr);
            const isMandatory = (i === mandatoryIndex);
            const entry: CharacterTrait = {
              id: trait.id ?? tr,
              name: trait.name ?? "",
              type: isMandatory ? "Mandatory" : "Lifepath",
              isOpen: isMandatory || trait.category[1] === "Common"
            };
            return entry;
          }) : [];
        }).flat());

        ruleset.traits
          .filter(trait => trait.stock?.[0] === stock[0] && trait.category[1] === "Common" && trait.id)
          .forEach(trait => {
            if (trait.id && characterTraits.existsAny("id", trait.id) === 0) {
              characterTraits.add({ id: trait.id, name: trait.name ?? "", type: "Common", isOpen: true });
            }
          });

        state.traits
          .filter(trait => trait.type === "General")
          .forEach(trait => {
            if (characterTraits.existsAny("id", trait.id) === 0) characterTraits.add(trait);
          });

        set(produce<CharacterBurnerTraitState>(state => {
          state.traits = characterTraits;
        }));

        useCharacterBurnerResourceStore.getState().updateResources();
        useCharacterBurnerResourceStore.getState().updateLessonOfOne();
        RefreshCharacterLimits();
      }
    }),
    { name: "useCharacterBurnerTraitStore" }
  )
);
