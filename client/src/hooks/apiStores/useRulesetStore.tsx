import { produce } from "immer";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { DeriveRulesetData } from "../../utils/DeriveRulesetData";
import { RequestRulesetsData, RequestRulesetsList } from "../../utils/Fetch";


type FetchState =
  | "fetch-full"
  | "fetching-list"
  | "fetch-data"
  | "fetching-data"
  | "done"
  | "failed";

interface RulesetStore {
  readonly fetchState: FetchState;

  readonly apiVersion: string | undefined;
  readonly rulesets: Ruleset[];
  readonly chosenRulesets: dat.RulesetId[];

  readonly abilities: Ability[];
  readonly abilitiesById: Map<dat.AbilityId, Ability>;
  readonly abilityTypes: string[];

  readonly stocks: Stock[];
  readonly stocksById: Map<dat.StockId, Stock>;
  readonly settings: Setting[];
  readonly settingsById: Map<dat.SettingId, Setting>;

  readonly skills: Skill[];
  readonly skillsById: Map<dat.SkillId, Skill>;
  readonly skillCategories: string[];
  readonly skillTypes: string[];

  readonly traits: Trait[];
  readonly traitsById: Map<dat.TraitId, Trait>;
  readonly traitCategories: string[];
  readonly traitTypes: string[];

  readonly lifepaths: Lifepath[];
  readonly lifepathsById: Map<dat.LifepathId, Lifepath>;

  readonly resources: Resource[];
  readonly resourcesById: Map<dat.ResourceId, Resource>;
  readonly resourceTypes: string[];

  readonly spellFacets: SpellFacets;
  readonly spellAltFacets: AltSpellFacets;

  readonly dowActions: DoWAction[];
  readonly racActions: RaCAction[];
  readonly fightActions: FightAction[];

  readonly practices: Practice[];
  readonly questions: Question[];

  setFetchState: (fetchState: FetchState) => void;
  fetchList: () => void;
  fetchData: () => void;

  // name/string search remains a linear scan -- it should be used veeery rarely; id lookups use the *ById maps below
  serveResult: <T>(row: T[], error: [id: unknown, msg: string]) => T;
  serveIndexedResult: <TId, TRow>(byId: Map<TId, TRow>, search: TId, msg: string) => TRow;
  getAbility: (search: dat.AbilityId | string) => Ability;
  getStock: (search: dat.StockId | string) => Stock;
  getSetting: (search: dat.SettingId | string) => Setting;
  getSkill: (search: dat.SkillId | string) => Skill;
  getTrait: (search: dat.TraitId | string) => Trait;
  getLifepath: (search: dat.LifepathId | string) => Lifepath;
  getResource: (search: dat.ResourceId | string) => Resource;
  getDoWAction: (search: dat.DuelOfWitsActionId | string) => DoWAction;
  getRaCAction: (search: dat.RangeAndCoverActionId | string) => RaCAction;
  getFightAction: (search: dat.FightActionId | string) => FightAction;
  getPractice: (search: string) => Practice;

  toggleDataset: (dataset: dat.RulesetId) => void;
  applyChosenRulesets: (rulesets: dat.RulesetId[]) => void;
  checkRulesets: (allowed: dat.RulesetId[]) => boolean;
  checkExactRulesets: (allowed: dat.RulesetId[]) => boolean;
}

// Tracks the in-flight fetchData call (if any) so a newer fetchList/fetchData can abort it
// instead of silently letting a stale request finish and overwrite fresher state.
let FetchDataController: AbortController | undefined;

export const useRulesetStore = create<RulesetStore>()(
  devtools(
    persist(
      (set, get) => ({
        fetchState: "fetch-full",

        apiVersion: undefined,
        rulesets: [],
        chosenRulesets: [],

        abilities: [],
        abilitiesById: new Map(),
        abilityTypes: [],

        stocks: [],
        stocksById: new Map(),
        settings: [],
        settingsById: new Map(),

        skills: [],
        skillsById: new Map(),
        skillCategories: [],
        skillTypes: [],

        traits: [],
        traitsById: new Map(),
        traitCategories: [],
        traitTypes: [],

        lifepaths: [],
        lifepathsById: new Map(),

        resources: [],
        resourcesById: new Map(),
        resourceTypes: [],

        dowActions: [],
        racActions: [],
        fightActions: [],

        practices: [],
        questions: [],

        spellFacets: {
          origins: [],
          elements: [],
          impetus: [],
          areaOfEffects: [],
          duration: []
        },

        spellAltFacets: {
          origins: [],
          primeElements: [],
          lowerElements: [],
          higherElements: [],
          impetus: [],
          areaOfEffects: [],
          duration: []
        },

        setFetchState: (fetchState: FetchState) => {
          set(produce<RulesetStore>(state => { state.fetchState = fetchState; }));
        },

        fetchList: () => {
          const setFetchState = get().setFetchState;
          setFetchState("fetching-list");

          RequestRulesetsList()
            .then(response => {
              if (response.rulesets.length === 0) throw new Error("no rulesets returned");
              const firstRuleset = response.rulesets[0];
              if (firstRuleset.id === null) throw new Error("no rulesets returned");
              const firstRulesetId = firstRuleset.id;

              const previousVersion = get().apiVersion;
              const previousChosenRulesets = get().chosenRulesets;
              const hasCachedData = get().abilities.length > 0;

              // Only trust the persisted selection if every ruleset in it still exists in the fresh list.
              const validIds = new Set(response.rulesets.map(v => v.id).filter((id): id is dat.RulesetId => id !== null));
              const previousSelectionStillValid = previousChosenRulesets.length > 0 && previousChosenRulesets.every(id => validIds.has(id));

              const sameVersion = previousVersion !== undefined && previousVersion === response.version;
              const canSkipDataFetch = sameVersion && previousSelectionStillValid && hasCachedData;

              set(produce<RulesetStore>(state => {
                state.apiVersion = response.version;
                state.rulesets = response.rulesets;
                if (!previousSelectionStillValid) state.chosenRulesets = [firstRulesetId, ...firstRuleset.expansionIds ?? []];
              }));

              setFetchState(canSkipDataFetch ? "done" : "fetch-data");
            })
            .catch((reason: unknown) => {
              console.error(reason);
              setFetchState("failed");
            });
        },

        fetchData: () => {
          const fetchState = get().fetchState;
          const setFetchState = get().setFetchState;
          const rulesets = get().chosenRulesets;

          if (fetchState === "fetch-data" || fetchState === "fetching-data") {
            FetchDataController?.abort();
            const controller = new AbortController();
            FetchDataController = controller;

            setFetchState("fetching-data");

            RequestRulesetsData(rulesets, controller.signal)
              .then(response => {
                if (controller.signal.aborted) return;

                const derived = DeriveRulesetData(response.ruleset);

                set(produce<RulesetStore>(state => {
                  Object.assign(state, derived);
                }));

                FetchDataController = undefined;
                setFetchState("done");
              })
              .catch((reason: unknown) => {
                if (controller.signal.aborted) return;
                FetchDataController = undefined;
                console.error(reason);
                setFetchState("failed");
              });
          }
        },

        serveResult<T>(row: T[], error: [id: unknown, msg: string]): Readonly<T> {
          if (row.length === 1) return row[0];
          else if (row.length > 1) throw new Error(`Found multiple ${error[1]} rows with ${typeof error[0] === "string" ? "name" : "id"} '${error[0] as string}'`);
          else throw new Error(`Could not find any ${error[1]} with ${typeof error[0] === "string" ? "name" : "id"} '${error[0] as string}'`);
        },

        serveIndexedResult<TId, TRow>(byId: Map<TId, TRow>, search: TId, msg: string): Readonly<TRow> {
          const row = byId.get(search);
          if (row === undefined) throw new Error(`Could not find any ${msg} with id '${search as string}'`);
          return row;
        },

        getAbility(search: dat.AbilityId | string) {
          if (typeof search !== "string") return get().serveIndexedResult(get().abilitiesById, search, "abilities");
          const rows = get().abilities.filter(v => v.name === search);
          return get().serveResult(rows, [search, "abilities"]);
        },

        getStock(search: dat.StockId | string) {
          if (typeof search !== "string") return get().serveIndexedResult(get().stocksById, search, "stocks");
          const rows = get().stocks.filter(v => v.name === search);
          return get().serveResult(rows, [search, "stocks"]);
        },

        getSetting(search: dat.SettingId | string) {
          if (typeof search !== "string") return get().serveIndexedResult(get().settingsById, search, "settings");
          const rows = get().settings.filter(v => v.name === search);
          return get().serveResult(rows, [search, "settings"]);
        },

        getSkill(search: dat.SkillId | string) {
          if (typeof search !== "string") return get().serveIndexedResult(get().skillsById, search, "skills");
          const rows = get().skills.filter(v => v.name === search);
          return get().serveResult(rows, [search, "skills"]);
        },

        getTrait(search: dat.TraitId | string) {
          if (typeof search !== "string") return get().serveIndexedResult(get().traitsById, search, "traits");
          const rows = get().traits.filter(v => v.name === search);
          return get().serveResult(rows, [search, "traits"]);
        },

        getLifepath(search: dat.LifepathId | string) {
          if (typeof search !== "string") return get().serveIndexedResult(get().lifepathsById, search, "lifepaths");
          const rows = get().lifepaths.filter(v => v.name === search);
          return get().serveResult(rows, [search, "lifepaths"]);
        },

        getResource(search: dat.ResourceId | string) {
          if (typeof search !== "string") return get().serveIndexedResult(get().resourcesById, search, "resources");
          const rows = get().resources.filter(v => v.name === search);
          return get().serveResult(rows, [search, "resources"]);
        },

        getDoWAction(search: dat.DuelOfWitsActionId | string) {
          const dowActions = get().dowActions;
          const rows = (typeof search === "string") ? dowActions.filter(v => v.name === search) : dowActions.filter(v => v.id === search);
          return get().serveResult(rows, [search, "dowActions"]);
        },

        getRaCAction(search: dat.RangeAndCoverActionId | string) {
          const racActions = get().racActions;
          const rows = (typeof search === "string") ? racActions.filter(v => v.name === search) : racActions.filter(v => v.id === search);
          return get().serveResult(rows, [search, "racActions"]);
        },

        getFightAction(search: dat.FightActionId | string) {
          const fightActions = get().fightActions;
          const rows = (typeof search === "string") ? fightActions.filter(v => v.name === search) : fightActions.filter(v => v.id === search);
          return get().serveResult(rows, [search, "fightActions"]);
        },

        getPractice(search: string) {
          const practices = get().practices;
          const rows = practices.filter(v => v.id === search);
          return get().serveResult(rows, [search, "practices"]);
        },

        toggleDataset: (ruleset: dat.RulesetId) => {
          set(produce<RulesetStore>(state => {
            if (state.rulesets.find(v => v.id === ruleset)?.isExpansion !== true) {
              state.fetchState = "fetch-data";
              state.chosenRulesets = [ruleset];
            }
            else if (state.chosenRulesets.includes(ruleset)) {
              state.fetchState = "fetch-data";
              state.chosenRulesets = state.chosenRulesets.filter(v => v !== ruleset);
            }
            else {
              state.fetchState = "fetch-data";
              state.chosenRulesets = [...state.chosenRulesets, ruleset];
            }
          }));
        },

        applyChosenRulesets: (rulesets: dat.RulesetId[]) => {
          set(produce<RulesetStore>(state => {
            state.chosenRulesets = rulesets;
            state.fetchState = "fetch-data";
          }));
        },

        checkRulesets: (allowed: dat.RulesetId[]) => {
          return get().chosenRulesets.some(ruleset => allowed.includes(ruleset));
        },

        checkExactRulesets: (allowed: dat.RulesetId[]) => {
          const state = get();
          return allowed.every(ruleset => state.chosenRulesets.includes(ruleset));
        }
      }),
      {
        name: "RulesetStore",
        version: 2,
        partialize: state => ({
          apiVersion: state.apiVersion,
          chosenRulesets: state.chosenRulesets,
          rulesets: state.rulesets,
          abilities: state.abilities,
          stocks: state.stocks,
          settings: state.settings,
          skills: state.skills,
          traits: state.traits,
          lifepaths: state.lifepaths,
          resources: state.resources,
          spellFacets: state.spellFacets,
          spellAltFacets: state.spellAltFacets,
          dowActions: state.dowActions,
          racActions: state.racActions,
          fightActions: state.fightActions,
          practices: state.practices,
          questions: state.questions
        }),
        // Maps (*ById) don't survive JSON persistence, so rebuild them -- along with the
        // derived category/type lists -- from the persisted raw arrays on rehydration.
        merge: (persisted, current) => {
          const merged = { ...current, ...(persisted as Partial<RulesetStore>) };
          return { ...merged, ...DeriveRulesetData(merged) };
        }
      }
    ),
    { name: "RulesetStore" }
  )
);
