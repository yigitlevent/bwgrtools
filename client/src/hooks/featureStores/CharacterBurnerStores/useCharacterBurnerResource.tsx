import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "./useCharacterBurnerMisc";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { GetLifepathOccurrences } from "../../../utils/GetLifepathOccurrences";
import { GetLifepathYears } from "../../../utils/GetLifepathYears";
import { RecordGet } from "../../../utils/RecordGet";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


export interface CharacterBurnerResourceState {
  resources: Record<string, CharacterResource>;

  reset: () => void;

  getResourcePools: (lifepaths?: Lifepath[]) => Points;

  addResource: (resource: CharacterResource) => void;
  removeResource: (guid: string) => void;
  editResourceDescription: (guid: string, description: string) => void;
  upgradeResourceCost: (guid: string, newCost: number) => void;
  updateResources: () => void;
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
        // A trait-granted resource's guaranteed-free tier (minCost) doesn't count against the pool --
        // only the portion the player paid to upgrade beyond it does.
        const spending = Object.values(get().resources).reduce((p, v) => p + (v.sourceTraitId !== undefined ? Math.max(0, v.cost - (v.minCost ?? 0)) : v.cost), 0);

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
        if (RecordGet(get().resources, guid)?.sourceTraitId !== undefined) return;

        set(produce<CharacterBurnerResourceState>(state => {
          delete state.resources[guid];
        }));
      },

      editResourceDescription: (guid: string, description: string) => {
        set(produce<CharacterBurnerResourceState>(state => {
          state.resources[guid].description = description;
        }));
      },

      upgradeResourceCost: (guid: string, newCost: number): void => {
        const resource = RecordGet(get().resources, guid);
        if (resource?.sourceTraitId === undefined) return;
        if (newCost < (resource.minCost ?? 0)) return;

        const { remaining } = get().getResourcePools();
        const additionalCost = newCost - resource.cost;
        if (additionalCost > remaining) return;

        set(produce<CharacterBurnerResourceState>(state => {
          state.resources[guid].cost = newCost;
        }));
      },

      updateResources: (): void => {
        const traitResourceKeyPrefix = "trait-";
        const traitResourceKey = (traitId: dat.TraitId): string => `${traitResourceKeyPrefix}${traitId.toString()}`;

        const ruleset = useRulesetStore.getState();
        const { traits } = useCharacterBurnerTraitStore.getState();
        const { special } = useCharacterBurnerMiscStore.getState();
        const state = get();

        const expectedKeys = new Set<string>();

        set(produce<CharacterBurnerResourceState>(draft => {
          traits.filter(trait => trait.isOpen).forEach(trait => {
            const grants = ruleset.getTrait(trait.id).grantsResources;
            if (!grants || grants.length === 0) return;

            const chosenType = RecordGet(special.chosenResourceType, trait.id);
            const grant = grants.length > 1 ? grants.find(g => ruleset.getResource(g.resource).type[0] === chosenType) ?? grants[0] : grants[0];

            const key = traitResourceKey(trait.id);
            expectedKeys.add(key);

            const rulesetResource = ruleset.getResource(grant.resource);
            if (rulesetResource.type[0] === null) throw new Error(`Resource ${rulesetResource.id.toString()} granted by trait ${trait.id.toString()} has no resourceTypeId.`);
            const existing = RecordGet(state.resources, key);
            const preserveExisting = existing?.sourceTraitId === trait.id;

            draft.resources[key] = {
              id: rulesetResource.id,
              name: rulesetResource.name,
              type: [rulesetResource.type[0], rulesetResource.type[1]],
              modifiers: existing?.modifiers ?? [],
              cost: preserveExisting ? existing.cost : grant.minCost,
              description: preserveExisting ? existing.description : "",
              sourceTraitId: trait.id,
              minCost: grant.minCost
            };
          });

          Object.keys(draft.resources).forEach(key => {
            if (key.startsWith(traitResourceKeyPrefix) && !expectedKeys.has(key)) delete draft.resources[key];
          });
        }));
      }
    }),
    { name: "useCharacterBurnerResourceStore" }
  )
);
