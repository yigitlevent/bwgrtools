import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerSpecialStore } from "./useCharacterBurnerSpecial";
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
  setFamilyHeirloomResource: (traitId: dat.TraitId, resource: Resource, cost: number) => void;
  clearFamilyHeirloomResource: () => void;
  updateLessonOfOne: () => void;
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
        const { special } = useCharacterBurnerSpecialStore.getState();

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

      setFamilyHeirloomResource: (traitId: dat.TraitId, resource: Resource, cost: number): void => {
        if (!resource.type[0]) return;
        const resourceTypeId = resource.type[0];

        set(produce<CharacterBurnerResourceState>(state => {
          state.resources["family-heirloom"] = {
            id: resource.id,
            name: resource.name,
            type: [resourceTypeId, resource.type[1]],
            modifiers: [],
            cost: Math.min(cost, 50),
            description: "",
            sourceTraitId: traitId,
            minCost: 0
          };
        }));
      },

      clearFamilyHeirloomResource: (): void => {
        set(produce<CharacterBurnerResourceState>(state => {
          delete state.resources["family-heirloom"];
        }));
      },

      updateLessonOfOne: (): void => {
        const { hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        const { special } = useCharacterBurnerSpecialStore.getState();
        const { stock } = useCharacterBurnerBasicsStore.getState();
        const ruleset = useRulesetStore.getState();
        const state = get();

        const chosenRelationship = special.lessonOfOneRelationship !== undefined ? RecordGet(state.resources, special.lessonOfOneRelationship) : undefined;

        // "important" (cost 10) relationship grants a 1D reputation, "powerful" (cost 15) grants 2D.
        const tierCost = chosenRelationship?.cost === 15 ? 2 : chosenRelationship?.cost === 10 ? 1 : undefined;

        set(produce<CharacterBurnerResourceState>(draft => {
          if (!hasTraitOpenByName("Lesson of One") || tierCost === undefined) {
            delete draft.resources["lesson-of-one"];
            return;
          }

          const rulesetReputation = ruleset.resources.find(r => r.stock[0] === stock[0] && r.type[1] === "Reputation");
          if (!rulesetReputation?.type[0]) return;
          const cost = rulesetReputation.costs.find(c => c[1].startsWith(`${tierCost.toString()}D`))?.[0] ?? rulesetReputation.costs[0][0];

          const trait = ruleset.getTrait("Lesson of One");
          if (!trait.id) return;

          draft.resources["lesson-of-one"] = {
            id: rulesetReputation.id,
            name: rulesetReputation.name,
            type: [rulesetReputation.type[0], rulesetReputation.type[1]],
            modifiers: [],
            cost,
            description: "Student of his mentor",
            sourceTraitId: trait.id,
            minCost: cost
          };
        }));
      },

      updateResources: (): void => {
        const traitResourceKeyPrefix = "trait-";
        // isChoice grants are keyed by trait alone (exactly one resource picked); non-choice grants
        // are keyed by trait+resource, since a trait can grant several resources simultaneously.
        const traitResourceKey = (traitId: dat.TraitId, resourceId?: dat.ResourceId): string =>
          resourceId === undefined ? `${traitResourceKeyPrefix}${traitId.toString()}` : `${traitResourceKeyPrefix}${traitId.toString()}-${resourceId.toString()}`;

        const ruleset = useRulesetStore.getState();
        const { traits, hasTraitOpenByName } = useCharacterBurnerTraitStore.getState();
        const { special } = useCharacterBurnerSpecialStore.getState();
        const state = get();

        const expectedKeys = new Set<string>();

        set(produce<CharacterBurnerResourceState>(draft => {
          traits.filter(trait => trait.isOpen).forEach(trait => {
            const rulesetTrait = ruleset.getTrait(trait.id);
            const grants = rulesetTrait.grantsResources;
            if (!grants || grants.length === 0) return;

            // Servant of the Citadel / Sworn to Protect: the trait's resource grant is conditional on
            // a qualifying Belief(+Instinct) the burner can't verify -- gated on a player self-report.
            if (trait.name === "Servant of the Citadel" && !special.servantOfCitadelQualifies) return;
            if (trait.name === "Sworn to Protect" && !special.swornToProtectQualifies) return;

            const isChoice = rulesetTrait.grantsResourcesIsChoice ?? true;

            const applyGrant = (grant: { resource: dat.ResourceId; minCost: number; }, key: string): void => {
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
            };

            if (isChoice) {
              const chosenType = RecordGet(special.chosenResourceType, trait.id);
              const grant = grants.length > 1 ? grants.find(g => ruleset.getResource(g.resource).type[0] === chosenType) ?? grants[0] : grants[0];
              applyGrant(grant, traitResourceKey(trait.id));
            }
            else {
              grants.forEach(grant => { applyGrant(grant, traitResourceKey(trait.id, grant.resource)); });
            }
          });

          Object.keys(draft.resources).forEach(key => {
            if (key.startsWith(traitResourceKeyPrefix) && !expectedKeys.has(key)) delete draft.resources[key];
          });

          if (!hasTraitOpenByName("Family Heirloom")) delete draft.resources["family-heirloom"];
        }));
      }
    }),
    { name: "useCharacterBurnerResourceStore" }
  )
);
