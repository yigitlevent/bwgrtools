import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { RecomputeCharacter } from "./recomputeCharacter";
import { useCharacterBurnerAttributeStore } from "./useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { useCharacterBurnerSkillStore } from "./useCharacterBurnerSkill";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { FilterLifepaths } from "../../../utils/FilterLifepaths";
import { GetLifepathOccurrences } from "../../../utils/GetLifepathOccurrences";
import { GetLifepathYears } from "../../../utils/GetLifepathYears";
import { Pairwise } from "../../../utils/Pairwise";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerLifepathState {
  availableLifepaths: Lifepath[];
  lifepaths: Lifepath[];

  reset: () => void;

  addLifepath: (lifepath: Lifepath) => void;
  removeLastLifepath: () => void;

  hasLifepath: (id: dat.LifepathId) => number;
  hasLifepathByName: (name: string) => number;
  hasSetting: (id: dat.SettingId) => number;
  hasSettingByName: (name: string) => number;

  getLeadCount: () => number;
  getAge: (lifepaths?: Lifepath[]) => number;

  getMentalPool: (lifepaths?: Lifepath[]) => Points;
  getPhysicalPool: (lifepaths?: Lifepath[]) => Points;
  getEitherPool: (lifepaths?: Lifepath[]) => Points;

  updateAvailableLifepaths: () => Lifepath[];
}

export const useCharacterBurnerLifepathStore = create<CharacterBurnerLifepathState>()(
  devtools(
    (set, get) => ({
      availableLifepaths: [],
      lifepaths: [],

      reset: (): void => {
        set({
          availableLifepaths: [],
          lifepaths: []
        });
      },

      addLifepath: (lifepath: Lifepath): void => {
        set(produce<CharacterBurnerLifepathState>(state => { state.lifepaths.push(lifepath); }));
        get().updateAvailableLifepaths();
        RecomputeCharacter("stat");
      },

      removeLastLifepath: (): void => {
        set(produce<CharacterBurnerLifepathState>(state => {
          state.lifepaths = state.lifepaths.slice(0, state.lifepaths.length - 1);
        }));
        get().updateAvailableLifepaths();
        RecomputeCharacter("stat");
      },

      hasLifepath: (id: dat.LifepathId): number => {
        return get().lifepaths.filter(v => v.id === id).length;
      },

      hasLifepathByName: (name: string): number => {
        return get().lifepaths.filter(v => v.name === name).length;
      },

      hasSetting: (id: dat.SettingId): number => {
        return get().lifepaths.filter(v => v.setting[0] === id).length;
      },

      hasSettingByName: (name: string): number => {
        return get().lifepaths.filter(v => v.setting[1] === name).length;
      },

      getLeadCount: (): number => {
        const state = get();
        if (state.lifepaths.length === 0) return 0;
        return Pairwise(state.lifepaths).reduce((pv, cv) => cv[0].setting[0] !== cv[1].setting[0] ? pv + 1 : pv, 0);
      },

      getAge: (lifepaths?: Lifepath[]): number => {
        const state = get();
        const lps = (lifepaths ?? state.lifepaths);

        if (lps.length === 0) return 0;

        const { special } = useCharacterBurnerMiscStore.getState();

        const yrs = lps.map(v => GetLifepathYears(v, special.variableAge));
        const sum = yrs.reduce((prev, curr) => prev + curr, 0);
        return sum + get().getLeadCount();
      },

      getMentalPool: (lifepaths?: Lifepath[]): Points => {
        const lps = lifepaths ?? get().lifepaths;
        const { getAgePool } = useCharacterBurnerBasicsStore.getState();
        const { stats } = useCharacterBurnerStatStore.getState();

        // Law of Diminishing Returns: a lifepath's stat pool contribution is lost entirely on its
        // 3rd+ occurrence.
        const occurrences = GetLifepathOccurrences(lps);
        const stockAgePool = getAgePool().mentalPool;
        const lifepathPool = lps.reduce((pv, cv, i) => occurrences[i] >= 3 ? pv : pv + (cv.pools.mentalStatPool ?? 0), 0);
        const total = stockAgePool + lifepathPool;

        const spent =
          Object.values(stats)
            .filter(s => s.poolType === "Mental")
            .map((v): number => v.mainPoolSpent.shade + v.mainPoolSpent.exponent)
            .reduce((pv, cv) => pv + cv);

        return { total: total, spent, remaining: total - spent };
      },

      getPhysicalPool: (lifepaths?: Lifepath[]): Points => {
        const lps = lifepaths ?? get().lifepaths;
        const { getAgePool } = useCharacterBurnerBasicsStore.getState();
        const { stats } = useCharacterBurnerStatStore.getState();

        // Law of Diminishing Returns: a lifepath's stat pool contribution is lost entirely on its
        // 3rd+ occurrence.
        const occurrences = GetLifepathOccurrences(lps);
        const stockAgePool = getAgePool().physicalPool;
        const lifepathPool = lps.reduce((pv, cv, i) => occurrences[i] >= 3 ? pv : pv + (cv.pools.physicalStatPool ?? 0), 0);
        const total = stockAgePool + lifepathPool;

        const spent =
          Object.values(stats)
            .filter(s => s.poolType === "Physical")
            .map((v): number => v.mainPoolSpent.shade + v.mainPoolSpent.exponent)
            .reduce((pv, cv) => pv + cv);

        return { total: total, spent, remaining: total - spent };
      },

      getEitherPool: (lifepaths?: Lifepath[]): Points => {
        const lps = lifepaths ?? get().lifepaths;
        const { stats } = useCharacterBurnerStatStore.getState();

        // Law of Diminishing Returns: a lifepath's stat pool contribution is lost entirely on its
        // 3rd+ occurrence.
        const occurrences = GetLifepathOccurrences(lps);
        const total = lps.reduce((pv, cv, i) => occurrences[i] >= 3 ? pv : pv + (cv.pools.eitherStatPool ?? 0), 0);
        const spent =
          Object.values(stats)
            .map((v): number => v.eitherPoolSpent.shade + v.eitherPoolSpent.exponent)
            .reduce((pv, cv) => pv + cv);

        return { total, spent, remaining: total - spent };
      },

      updateAvailableLifepaths: (onlyReturn?: boolean): Lifepath[] => {
        const { lifepaths, hasSetting, getAge } = get();

        const ruleset = useRulesetStore.getState();
        const { gender, stock } = useCharacterBurnerBasicsStore.getState();
        const { hasQuestionTrue } = useCharacterBurnerMiscStore.getState();
        const { hasSkillOpen } = useCharacterBurnerSkillStore.getState();
        const { hasTraitOpen } = useCharacterBurnerTraitStore.getState();
        const { attributes, hasAttribute } = useCharacterBurnerAttributeStore.getState();


        const possibleLifepaths: Lifepath[] = FilterLifepaths({
          rulesetLifepaths: ruleset.lifepaths,
          stock: stock,
          age: getAge(),
          gender: gender,
          lifepaths: lifepaths,
          attributes: attributes,
          hasAttribute: hasAttribute,
          hasSkillOpen: hasSkillOpen,
          hasTraitOpen: hasTraitOpen,
          hasSetting: hasSetting,
          hasQuestionTrue: hasQuestionTrue
        });

        if (onlyReturn) return possibleLifepaths;

        set(produce<CharacterBurnerLifepathState>(state => { state.availableLifepaths = possibleLifepaths; }));
        return possibleLifepaths;
      }
    }),
    { name: "useCharacterBurnerLifepathStore" }
  )
);
