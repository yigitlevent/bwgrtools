import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { GetLifepathOccurrences } from "../../../utils/GetLifepathOccurrences";
import { GetLifepathYears } from "../../../utils/GetLifepathYears";


export interface CharacterBurnerResourceState {
  resources: Record<string, CharacterResource>;

  reset: () => void;

  getResourcePools: (lifepaths?: Lifepath[]) => Points;

  addResource: (resource: CharacterResource) => void;
  removeResource: (guid: string) => void;
  editResourceDescription: (guid: string, description: string) => void;
}

export const useCharacterBurnerResourceStore = create<CharacterBurnerResourceState>()(
  devtools(
    (set, get) => ({
      resources: {},

      reset: () => {
        set(produce<CharacterBurnerResourceState>(state => {
          state.resources = {};
        }));
      },

      getResourcePools: (lifepaths?: Lifepath[]): Points => {
        const spending = Object.values(get().resources).map(v => v.cost).reduce((p, v) => p += v, 0);

        const state = useCharacterBurnerLifepathStore.getState();
        const lps = lifepaths ?? state.lifepaths;
        const { special } = useCharacterBurnerMiscStore.getState();

        // isRPMultipliedByYear: pools.resourcePoints is a per-year rate, not a flat amount --
        // e.g. Advisor to the Court grants 10 RP per year actually spent in the lifepath.
        // getHalfRPFromPrevLP: this lifepath grants (in addition to its own RP) half of the
        // immediately preceding lifepath's own RP, rounded down -- e.g. Hostage.
        const resolveRps = (lp: Lifepath, prevLp: Lifepath | undefined): number => {
          const base = lp.flags.isRPMultipliedByYear ? (lp.pools.resourcePoints ?? 0) * GetLifepathYears(lp, special.variableAge) : (lp.pools.resourcePoints ?? 0);
          const fromPrev = lp.flags.getHalfRPFromPrevLP && prevLp ? Math.floor((prevLp.pools.resourcePoints ?? 0) / 2) : 0;
          return base + fromPrev;
        };

        // Law of Diminishing Returns: a lifepath's resource point contribution is halved (rounded
        // down) on its 3rd occurrence, and stays halved (not reduced further) on its 4th+ occurrence.
        const occurrences = GetLifepathOccurrences(lps);
        const totalRps = lps.reduce((pv, cv, i) => pv + Math.floor(resolveRps(cv, lps[i - 1]) * (occurrences[i] >= 3 ? 0.5 : 1)), 0);

        return { total: totalRps, spent: spending, remaining: totalRps - spending };
      },

      addResource: (resource: CharacterResource) => {
        set(produce<CharacterBurnerResourceState>(state => {
          state.resources[self.crypto.randomUUID()] = resource;
        }));
      },

      removeResource: (guid: string) => {
        set(produce<CharacterBurnerResourceState>(state => {
          delete state.resources[guid];
        }));
      },

      editResourceDescription: (guid: string, description: string) => {
        set(produce<CharacterBurnerResourceState>(state => {
          state.resources[guid].description = description;
        }));
      }

      // TODO: auto resources from traits list -- some BWG traits grant free resources (gear,
      // animals, etc.) on their own. Nothing in the ruleset data model links a Trait to a Resource
      // yet (Trait has no `resources` field), so this needs a new DB relationship (shared/db
      // migrations + api/src/services/traits.service.ts + the Trait type in shared/@types/bwgr.d.ts)
      // before a client-side "grant these resources when this trait is open" step can be added here.
    }),
    { name: "useCharacterBurnerResourceStore" }
  )
);
