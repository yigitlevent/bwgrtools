import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
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
   * On the Nth occurrence of a repeated lifepath, its Nth trait (not always the 1st) is the mandatory one.
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
        }
      },

      addGeneralTrait: (trait: Trait): void => {
        if (!trait.id) return;
        const charTrait: CharacterTrait = { id: trait.id, name: trait.name ?? "", isOpen: false, type: "General" };
        set(produce<CharacterBurnerTraitState>(state => { state.traits = new UniqueArray(state.traits.add(charTrait).items); }));
      },

      removeGeneralTrait: (traitId: dat.TraitId): void => {
        set(produce<CharacterBurnerTraitState>(state => {
          state.traits = new UniqueArray(state.traits.remove(traitId).items);
        }));
      },

      getTraitPools: (lifepaths?: Lifepath[]): Points => {
        const { getTrait } = useRulesetStore.getState();
        const lps = lifepaths ?? useCharacterBurnerLifepathStore.getState().lifepaths;
        const state = get();

        const tTotal = lps.reduce((pv, cv) => pv + (cv.pools.traitPool ?? 0), 0);
        let tSpent = 0;

        state.traits.forEach(trait => {
          if (trait.isOpen) {
            if (trait.type === "Mandatory" || trait.type === "Lifepath") tSpent += 1;
            else if (trait.type === "General") {
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

        // On the Nth time a lifepath is taken, its Nth trait is the mandatory one (1st time -> 1st
        // trait, 2nd time -> 2nd trait, etc.), rather than always the 1st.
        const occurrenceCounts = new Map<dat.LifepathId, number>();

        // Add Lifepath Traits
        const characterTraits = new UniqueArray<dat.TraitId, CharacterTrait>(lifepaths.map(lp => {
          const occurrence = lp.id !== null ? (occurrenceCounts.get(lp.id) ?? 0) : 0;
          if (lp.id !== null) occurrenceCounts.set(lp.id, occurrence + 1);

          return lp.traits ? lp.traits.map((tr: dat.TraitId, i: number) => {
            const trait = ruleset.getTrait(tr);
            const isMandatory = (i === occurrence);
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

        useCharacterBurnerMiscStore.getState().refreshTraitEffects();
      }
    }),
    { name: "useCharacterBurnerTraitStore" }
  )
);
