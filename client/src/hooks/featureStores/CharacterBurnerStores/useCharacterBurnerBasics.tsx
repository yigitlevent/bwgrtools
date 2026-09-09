import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { ResetCharacterBurner } from "./recomputeCharacter";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerBasicsState {
  name: string;
  concept: string;
  gender: "Male" | "Female";
  stock: [id: dat.StockId, name: string];

  beliefs: { name: string; belief: string; }[];
  instincts: { name: string; instinct: string; }[];

  setName: (name: string) => void;
  setConcept: (concept: string) => void;
  setGender: (gender: "Male" | "Female") => void;

  setStockAndReset: (stock: [id: dat.StockId, name: string]) => void;

  setBelief: (index: number, belief: string) => void;
  setInstinct: (index: number, instinct: string) => void;

  getAgePool: () => { minAge: number; mentalPool: number; physicalPool: number; };
}

export const useCharacterBurnerBasicsStore = create<CharacterBurnerBasicsState>()(
  devtools(
    (set, get) => ({
      stock: [0 as dat.StockId, "Dwarf"],
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
      ],

      setStockAndReset: (stock: [id: dat.StockId, name: string]): void => {
        set({
          stock,
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

        ResetCharacterBurner();
      },

      setName: (name: string): void => {
        set({ name });
      },

      setConcept: (concept: string): void => {
        set({ concept });
      },

      setGender: (gender: "Male" | "Female"): void => {
        set({ gender });
      },

      setBelief: (index: number, belief: string): void => {
        set(produce<CharacterBurnerBasicsState>(state => {
          state.beliefs[index].belief = belief;
        }));
      },

      setInstinct: (index: number, instinct: string): void => {
        set(produce<CharacterBurnerBasicsState>(state => {
          state.instincts[index].instinct = instinct;
        }));
      },

      getAgePool: (): { minAge: number; mentalPool: number; physicalPool: number; } => {
        const { getStock } = useRulesetStore.getState();
        const { getAge } = useCharacterBurnerLifepathStore.getState();
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        const { stock } = get();

        const age = getAge();
        if (age === 0) return { minAge: 0, mentalPool: 0, physicalPool: 0 };

        // Vigor of Youth: a character starting older than 40 uses the same 7 mental / 14 physical
        // pool a younger character would, instead of whatever pool their actual age bracket grants.
        if (age > 40 && hasTraitOpenByName("Vigor of Youth")) return { minAge: 0, mentalPool: 7, physicalPool: 14 };

        const stockMaybe = getStock(stock[0]);
        const agePool = stockMaybe.agePool;
        return agePool.filter(a => age > a.minAge).reduce((pv, cv) => pv.minAge > cv.minAge ? pv : cv);
      }
    }),
    { name: "useCharacterBurnerBasicsStore" }
  )
);
