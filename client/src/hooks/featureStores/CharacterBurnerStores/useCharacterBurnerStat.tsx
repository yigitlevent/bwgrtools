import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { RecomputeCharacter } from "./recomputeCharacter";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { Clamp } from "../../../utils/Clamp";


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
      stats: {
        "Will": { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
        "Perception": { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
        "Power": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
        "Agility": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
        "Forte": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
        "Speed": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
      },

      reset: (): void => {
        set({
          stats: {
            "Will": { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
            "Perception": { poolType: "Mental", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
            "Power": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
            "Agility": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
            "Forte": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } },
            "Speed": { poolType: "Physical", shadeShifted: false, mainPoolSpent: { shade: 0, exponent: 0 }, eitherPoolSpent: { shade: 0, exponent: 0 } }
          }
        });
      },

      getStat: (statName: string): AbilityPoints => {
        const state = get();
        const shade = state.stats[statName].shadeShifted ? "G" : "B";
        const exponent = state.stats[statName].eitherPoolSpent.exponent + state.stats[statName].mainPoolSpent.exponent;
        return { shade, exponent };
      },

      shiftStatShade: (statName: string): void => {
        const { getMentalPool, getEitherPool, getPhysicalPool } = useCharacterBurnerLifepathStore.getState();

        set(produce<CharacterBurnerStatState>(state => {
          const stat = state.stats[statName];
          const newIsShifted = !state.stats[statName].shadeShifted;

          const mentalAndHasRemaining = stat.poolType === "Mental" && getMentalPool().remaining + getEitherPool().remaining >= 5;
          const physicalAndHasRemaining = stat.poolType === "Physical" && getPhysicalPool().remaining + getEitherPool().remaining >= 5;

          if (newIsShifted && (mentalAndHasRemaining || physicalAndHasRemaining)) {
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
        const { limits } = useCharacterBurnerMiscStore.getState();
        const { getMentalPool, getEitherPool, getPhysicalPool } = useCharacterBurnerLifepathStore.getState();

        set(produce<CharacterBurnerStatState>(state => {
          const stat = state.stats[statName];
          const potentialExponent = stat.mainPoolSpent.exponent + (decrease ? -1 : 1);
          const stockLimit = limits.stats[statName].max;

          if (decrease) {
            const hasMainSpending = state.stats[statName].mainPoolSpent.exponent > 0;
            const hasEitherSpending = state.stats[statName].eitherPoolSpent.exponent > 0;

            if (hasMainSpending) state.stats[statName].mainPoolSpent.exponent -= 1;
            else if (hasEitherSpending) state.stats[statName].eitherPoolSpent.exponent -= 1;
          }
          else if (potentialExponent <= stockLimit) {
            const hasMentalRemaining = stat.poolType === "Mental" && getMentalPool().remaining > 0;
            const hasPhysicalRemaining = stat.poolType === "Physical" && getPhysicalPool().remaining > 0;
            const hasEitherRemaining = getEitherPool().remaining > 0;

            if (hasMentalRemaining || hasPhysicalRemaining) state.stats[statName].mainPoolSpent.exponent += 1;
            else if (hasEitherRemaining) state.stats[statName].eitherPoolSpent.exponent += 1;
          }
        }));

        RecomputeCharacter("skillTrait");
      }
    }),
    { name: "useCharacterBurnerStatStore" }
  )
);
