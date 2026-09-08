import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { GetLifepathOccurrences } from "../../../utils/GetLifepathOccurrences";


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
        // TODO: Lifepath.flags.isRPMultipliedByYear and .getHalfRPFromPrevLP are not applied here:
        // this is a systemic gap, not specific to resources -- the equivalent GSP/LSP flags on skill
        // pools (useCharacterBurnerSkill.tsx's getSkillPools) are unimplemented too, and there's no
        // existing formula anywhere in the codebase to derive the intended calculation from.

        // Law of Diminishing Returns: a lifepath's resource point contribution is halved (rounded
        // down) on its 3rd occurrence, and stays halved (not reduced further) on its 4th+ occurrence.
        const occurrences = GetLifepathOccurrences(lps);
        const totalRps = lps.reduce((pv, cv, i) => pv + Math.floor((cv.pools.resourcePoints ?? 0) * (occurrences[i] >= 3 ? 0.5 : 1)), 0);

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
