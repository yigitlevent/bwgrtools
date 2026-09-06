import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";


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
        // TODO: Special lifepaths should matter here
        const totalRps = lps.map(v => v.pools.resourcePoints ?? 0).reduce((pv, cv) => pv + cv, 0);

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

      // TODO: auto resources from traits list
      // state.totals.resources.fromTraitsList = newResources;
    }),
    { name: "useCharacterBurnerResourceStore" }
  )
);
