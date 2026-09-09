import { produce } from "immer";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

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

              set(produce<RulesetStore>(state => {
                state.rulesets = response.rulesets;
                state.chosenRulesets = [firstRulesetId];
              }));

              setFetchState("fetch-data");
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

                const abilities = response.ruleset.abilities;
                const abilityTypes = [...response.ruleset.abilities.reduce((a, v) => a.add(v.abilityType[1]), new Set<string>())];
                const stocks = response.ruleset.stocks;
                const settings = response.ruleset.settings;
                const skills = response.ruleset.skills;
                const skillCategories = [...response.ruleset.skills.reduce((a, v) => a.add(v.category[1]), new Set<string>())];
                const skillTypes = [...response.ruleset.skills.reduce((a, v) => a.add(v.type[1]), new Set<string>())];

                const traits = response.ruleset.traits;
                const traitCategories = [...response.ruleset.traits.reduce((a, v) => a.add(v.category[1]), new Set<string>())];
                const traitTypes = [...response.ruleset.traits.reduce((a, v) => a.add(v.type[1]), new Set<string>())];

                const toIdMap = <TId, TRow extends { id: TId | null; }>(rows: TRow[]): Map<TId, TRow> =>
                  new Map(rows.filter((v): v is TRow & { id: TId; } => v.id !== null).map(v => [v.id, v]));

                set(produce<RulesetStore>(state => {
                  state.abilities = abilities;
                  state.abilitiesById = toIdMap(abilities);
                  state.abilityTypes = abilityTypes;

                  state.stocks = stocks;
                  state.stocksById = toIdMap(stocks);
                  state.settings = settings;
                  state.settingsById = toIdMap(settings);

                  state.skills = skills;
                  state.skillsById = toIdMap(skills);
                  state.skillCategories = skillCategories;
                  state.skillTypes = skillTypes;

                  state.traits = traits;
                  state.traitsById = toIdMap(traits);
                  state.traitCategories = traitCategories;
                  state.traitTypes = traitTypes;

                  state.lifepaths =
                    response.ruleset.lifepaths
                      .map(lifepath => {
                        const lp = { ...lifepath };
                        if (lifepath.leads !== undefined) lp.leads = lifepath.leads.filter(leadId => settings.some(x => x.id === leadId));
                        if (lifepath.skills !== undefined) lp.skills = lifepath.skills.filter(skillId => skills.some(x => x.id === skillId));
                        if (lifepath.traits !== undefined) lp.traits = lifepath.traits.filter(traitId => traits.some(x => x.id === traitId));

                        if (lp.requirements !== undefined) {
                          lp.requirements =
                            lp.requirements
                              .map(rb => {
                                return {
                                  ...rb,
                                  items: rb.items
                                    .filter(item => {
                                      const setting = item.setting;
                                      const lifepath = item.lifepath;
                                      const skill = item.skill;
                                      const trait = item.trait;
                                      if (setting !== undefined) return state.settings.some(x => x.id === setting[0]);
                                      else if (lifepath !== undefined) return response.ruleset.lifepaths.some(x => x.id === lifepath[0]);
                                      else if (skill !== undefined) return state.skills.some(x => x.id === skill[0]);
                                      else if (trait !== undefined) return state.traits.some(x => x.id === trait[0]);
                                      return true;
                                    })
                                };
                              });
                        }

                        return lp;
                      });
                  state.lifepathsById = toIdMap(state.lifepaths);

                  state.resources = response.ruleset.resources;
                  state.resourcesById = toIdMap(response.ruleset.resources);
                  state.resourceTypes = [...response.ruleset.resources.reduce((a, v) => a.add(v.type[1]), new Set<string>())];

                  state.spellFacets = response.ruleset.spellFacets;
                  state.spellAltFacets = response.ruleset.spellAltFacets;

                  state.dowActions = response.ruleset.dowActions;
                  state.racActions = response.ruleset.racActions;
                  state.fightActions = response.ruleset.fightActions;

                  state.practices = response.ruleset.practices;
                  state.questions = response.ruleset.questions;
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
      { name: "RulesetStore", version: 1, partialize: state => ({ chosenRulesets: state.chosenRulesets }) }
    ),
    { name: "RulesetStore" }
  )
);
