import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CreateInitialStats } from "./createInitialStats";
import { RecomputeCharacter } from "./recomputeCharacter";
import { RefreshCharacterLimits } from "./refreshCharacterLimits";
import { ResolvePoolForStat } from "./resolvePoolForStat";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerLimitsStore } from "./useCharacterBurnerLimits";
import { useCharacterBurnerSpecialStore } from "./useCharacterBurnerSpecial";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { Clamp } from "../../../utils/Clamp";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerStatState {
  stats: Record<string, StatData>;

  reset: () => void;

  getStat: (statName: string) => AbilityPoints;

  shiftStatShade: (statName: string) => void;
  modifyStatExponent: (statName: string, decrease?: boolean) => void;
}

export const useCharacterBurnerStatStore = create<CharacterBurnerStatState>()(
  devtools(
    (set, get) => ({
      stats: CreateInitialStats(),

      reset: (): void => {
        set({ stats: CreateInitialStats() });
      },

      getStat: (statName: string): AbilityPoints => {
        const state = get();
        const shade = state.stats[statName].shadeShifted ? "G" : "B";
        const exponent = state.stats[statName].eitherPoolSpent.exponent + state.stats[statName].mainPoolSpent.exponent;

        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        const { special } = useCharacterBurnerSpecialStore.getState();
        const ruleset = useRulesetStore.getState();

        let penalty = 0;
        if (statName === "Agility" && hasTraitOpenByName("Missing Hand")) penalty += 1;
        if (hasTraitOpenByName("Frail") && special.frailStat !== undefined && ruleset.getAbility(special.frailStat).name === statName) penalty += 1;

        let bonus = 0;
        if (hasTraitOpenByName("Child Prodigy") && special.childProdigyStat !== undefined && ruleset.getAbility(special.childProdigyStat).name === statName) bonus += 3;

        return { shade, exponent: exponent - penalty + bonus };
      },

      shiftStatShade: (statName: string): void => {
        const { getMentalPool, getEitherPool, getPhysicalPool } = useCharacterBurnerLifepathStore.getState();

        set(produce<CharacterBurnerStatState>(state => {
          const stat = state.stats[statName];
          const newIsShifted = !state.stats[statName].shadeShifted;

          const ownPool = ResolvePoolForStat(stat.poolType, getMentalPool, getPhysicalPool);
          const hasRemaining = ownPool.remaining + getEitherPool().remaining >= 5;

          if (newIsShifted && hasRemaining) {
            const decreaseFromMainPool = Clamp(5, 0, getPhysicalPool().remaining);
            const decreaseFromEitherPool = 5 - decreaseFromMainPool;

            state.stats[statName].shadeShifted = newIsShifted;
            state.stats[statName].mainPoolSpent.shade -= decreaseFromMainPool;
            state.stats[statName].eitherPoolSpent.shade -= decreaseFromEitherPool;
          }
          else if (!newIsShifted) {
            state.stats[statName].shadeShifted = newIsShifted;
            state.stats[statName].mainPoolSpent.shade = 0;
            state.stats[statName].eitherPoolSpent.shade = 0;
          }
        }));

        RecomputeCharacter("skillTrait");
      },

      modifyStatExponent: (statName: string, decrease?: boolean): void => {
        const { limits } = useCharacterBurnerLimitsStore.getState();
        const { getMentalPool, getEitherPool, getPhysicalPool } = useCharacterBurnerLifepathStore.getState();

        set(produce<CharacterBurnerStatState>(state => {
          const stat = state.stats[statName];
          const currentExponent = stat.mainPoolSpent.exponent + stat.eitherPoolSpent.exponent;
          const potentialExponent = currentExponent + (decrease === true ? -1 : 1);
          const stockLimit = limits.stats[statName].max;

          if (decrease === true) {
            const hasMainSpending = state.stats[statName].mainPoolSpent.exponent > 0;
            const hasEitherSpending = state.stats[statName].eitherPoolSpent.exponent > 0;

            if (hasMainSpending) state.stats[statName].mainPoolSpent.exponent -= 1;
            else if (hasEitherSpending) state.stats[statName].eitherPoolSpent.exponent -= 1;
          }
          else if (potentialExponent <= stockLimit) {
            const ownPool = ResolvePoolForStat(stat.poolType, getMentalPool, getPhysicalPool);
            const hasOwnPoolRemaining = ownPool.remaining > 0;
            const hasEitherRemaining = getEitherPool().remaining > 0;

            if (hasOwnPoolRemaining) state.stats[statName].mainPoolSpent.exponent += 1;
            else if (hasEitherRemaining) state.stats[statName].eitherPoolSpent.exponent += 1;
          }
        }));

        RefreshCharacterLimits();
        RecomputeCharacter("skillTrait");
      }
    }),
    { name: "useCharacterBurnerStatStore" }
  )
);
