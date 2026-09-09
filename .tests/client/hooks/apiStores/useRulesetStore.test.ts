import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRulesetStore } from "../../../../client/src/hooks/apiStores/useRulesetStore";


function MockFetchResponse(ok: boolean, body: unknown, status = 200): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body)
  }));
}

function Ability(overrides: Partial<Ability> = {}): Ability {
  return {
    id: 1 as unknown as dat.AbilityId,
    name: "Will",
    abilityType: [1 as unknown as dat.AbilityTypeId, "Attribute"],
    hasShades: true,
    ...overrides
  };
}

function EmptyRulesetData(): RulesetResponse["ruleset"] {
  return {
    abilities: [],
    stocks: [],
    settings: [],
    skills: [],
    traits: [],
    lifepaths: [],
    resources: [],
    spellFacets: { origins: [], elements: [], impetus: [], areaOfEffects: [], duration: [] },
    spellAltFacets: { origins: [], primeElements: [], lowerElements: [], higherElements: [], impetus: [], areaOfEffects: [], duration: [] },
    dowActions: [],
    racActions: [],
    fightActions: [],
    practices: [],
    questions: []
  };
}

function ResetStore(): void {
  useRulesetStore.setState({
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
    questions: []
  });
}

describe("useRulesetStore", () => {
  beforeEach(() => {
    ResetStore();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchList", () => {
    it("populates rulesets and chooses the first one, then moves to fetch-data", () => {
      const rulesets: Ruleset[] = [
        { id: "core" as unknown as dat.RulesetId, name: "Core", isOfficial: true, isPublic: true, isExpansion: false },
        { id: "exp" as unknown as dat.RulesetId, name: "Expansion", isOfficial: true, isPublic: true, isExpansion: true }
      ];
      MockFetchResponse(true, { rulesets });

      useRulesetStore.getState().fetchList();

      return new Promise<void>(resolve => {
        setTimeout(() => {
          const state = useRulesetStore.getState();
          expect(state.rulesets).toEqual(rulesets);
          expect(state.chosenRulesets).toEqual(["core"]);
          expect(state.fetchState).toBe("fetch-data");
          resolve();
        }, 0);
      });
    });

    it("marks fetchState as failed when no rulesets are returned", async () => {
      MockFetchResponse(true, { rulesets: [] });
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      useRulesetStore.getState().fetchList();
      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("failed"));

      errorSpy.mockRestore();
    });

    it("marks fetchState as failed when the request itself fails", async () => {
      MockFetchResponse(false, {}, 500);
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      useRulesetStore.getState().fetchList();
      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("failed"));

      errorSpy.mockRestore();
    });
  });

  describe("fetchData", () => {
    it("does nothing when fetchState is not fetch-data/fetching-data", async () => {
      useRulesetStore.setState({ fetchState: "done" });
      MockFetchResponse(true, { ruleset: EmptyRulesetData() });

      useRulesetStore.getState().fetchData();

      expect(fetch).not.toHaveBeenCalled();
    });

    it("populates ability/stock/setting/skill/trait state and marks fetchState done", async () => {
      const ability = Ability();
      useRulesetStore.setState({ fetchState: "fetch-data", chosenRulesets: ["core" as unknown as dat.RulesetId] });
      MockFetchResponse(true, {
        ruleset: {
          ...EmptyRulesetData(),
          abilities: [ability]
        }
      });

      useRulesetStore.getState().fetchData();
      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("done"));

      const state = useRulesetStore.getState();
      expect(state.abilities).toEqual([ability]);
      expect(state.abilitiesById.get(ability.id!)).toEqual(ability);
      expect(state.abilityTypes).toEqual(["Attribute"]);
    });

    it("filters out lead/skill/trait ids on lifepaths that no longer exist in the fetched ruleset", async () => {
      const keptSetting: Setting = { rulesets: null, id: 1 as unknown as dat.SettingId, name: "Home", nameShort: "Home", stock: [1 as unknown as dat.StockId, "Human"], isSubsetting: false };
      const lifepath: Lifepath = {
        rulesets: null,
        id: 1 as unknown as dat.LifepathId,
        name: "Farmer",
        stock: [1 as unknown as dat.StockId, "Human"],
        setting: [1 as unknown as dat.SettingId, "Home"],
        years: 1,
        pools: { eitherStatPool: null, mentalStatPool: null, physicalStatPool: null, generalSkillPool: null, lifepathSkillPool: null, traitPool: null, resourcePoints: null },
        flags: { isBorn: true, isGSPMultipliedByYear: false, isLSPMultipliedByYear: false, isRPMultipliedByYear: false, getHalfGSPFromPrevLP: false, getHalfLSPFromPrevLP: false, getHalfRPFromPrevLP: false },
        leads: [99 as unknown as dat.SettingId],
        skills: [99 as unknown as dat.SkillId],
        traits: [99 as unknown as dat.TraitId]
      };

      useRulesetStore.setState({ fetchState: "fetch-data" });
      MockFetchResponse(true, {
        ruleset: {
          ...EmptyRulesetData(),
          settings: [keptSetting],
          lifepaths: [lifepath]
        }
      });

      useRulesetStore.getState().fetchData();
      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("done"));

      const result = useRulesetStore.getState().lifepaths[0];
      // the original arrays are filtered in place (not dropped) -- ids absent from the freshly
      // fetched settings/skills/traits are removed, leaving an empty array rather than undefined.
      expect(result.leads).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.traits).toEqual([]);
    });

    it("filters requirement items referencing settings/lifepaths/skills/traits that no longer exist", async () => {
      const keptSetting: Setting = { rulesets: null, id: 1 as unknown as dat.SettingId, name: "Home", nameShort: "Home", stock: [1 as unknown as dat.StockId, "Human"], isSubsetting: false };
      const lifepathWithReqs: Lifepath = {
        rulesets: null,
        id: 1 as unknown as dat.LifepathId,
        name: "Farmer",
        stock: [1 as unknown as dat.StockId, "Human"],
        setting: [1 as unknown as dat.SettingId, "Home"],
        years: 1,
        pools: { eitherStatPool: null, mentalStatPool: null, physicalStatPool: null, generalSkillPool: null, lifepathSkillPool: null, traitPool: null, resourcePoints: null },
        flags: { isBorn: true, isGSPMultipliedByYear: false, isLSPMultipliedByYear: false, isRPMultipliedByYear: false, getHalfGSPFromPrevLP: false, getHalfLSPFromPrevLP: false, getHalfRPFromPrevLP: false },
        requirements: [{
          logicType: [1 as unknown as dat.LogicTypeId, "AND"],
          mustFulfill: true,
          fulfillmentAmount: null,
          items: [
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "setting"], setting: [99 as unknown as dat.SettingId, "Gone"] },
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "lifepath"], lifepath: [99 as unknown as dat.LifepathId, "Gone"] },
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "skill"], skill: [99 as unknown as dat.SkillId, "Gone"] },
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "trait"], trait: [99 as unknown as dat.TraitId, "Gone"] },
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "minYears"], minYears: 5 }
          ]
        }]
      };

      useRulesetStore.setState({ fetchState: "fetch-data" });
      MockFetchResponse(true, {
        ruleset: {
          ...EmptyRulesetData(),
          settings: [keptSetting],
          lifepaths: [lifepathWithReqs]
        }
      });

      useRulesetStore.getState().fetchData();
      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("done"));

      const result = useRulesetStore.getState().lifepaths[0];
      // only the minYears item survives -- setting/lifepath/skill/trait items all reference ids
      // absent from the freshly-fetched ruleset, so they're dropped.
      expect(result.requirements?.[0].items).toEqual([
        { logicType: [1, "minYears"], minYears: 5 }
      ]);
    });

    it("marks fetchState as failed when the request fails", async () => {
      useRulesetStore.setState({ fetchState: "fetch-data" });
      MockFetchResponse(false, {}, 500);
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      useRulesetStore.getState().fetchData();
      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("failed"));

      errorSpy.mockRestore();
    });

    it("derives skill/trait categories+types and keeps requirement items referencing surviving skills/traits/lifepaths", async () => {
      const settingId = 1 as unknown as dat.SettingId;
      const skillId = 1 as unknown as dat.SkillId;
      const traitId = 1 as unknown as dat.TraitId;
      const lifepathId = 1 as unknown as dat.LifepathId;
      const resourceId = 1 as unknown as dat.ResourceId;

      const setting: Setting = { rulesets: null, id: settingId, name: "Home", nameShort: "Home", stock: [1 as unknown as dat.StockId, "Human"], isSubsetting: false };
      const skill: Skill = { rulesets: null, id: skillId, name: "Sword", category: [1 as unknown as dat.SkillCategoryId, "Physical"], type: [1 as unknown as dat.SkillTypeId, "General"], flags: { dontList: false, isMagical: false, isTraining: false }, tool: { typeId: 1 as unknown as dat.SkillToolTypeId, tool: "" } };
      const trait: Trait = { rulesets: null, id: traitId, name: "Brave", category: [1 as unknown as dat.TraitCategoryId, "General"], type: [1 as unknown as dat.TraitTypeId, "Character"], cost: 1 };
      const resource: Resource = { rulesets: null, id: resourceId, name: "Land", stock: [1 as unknown as dat.StockId, "Human"], type: [1 as unknown as dat.ResourceTypeId, "Property"], costs: [[5, "5D"]], modifiers: [] };

      const lifepath: Lifepath = {
        rulesets: null,
        id: lifepathId,
        name: "Farmer",
        stock: [1 as unknown as dat.StockId, "Human"],
        setting: [settingId, "Home"],
        years: 1,
        pools: { eitherStatPool: null, mentalStatPool: null, physicalStatPool: null, generalSkillPool: null, lifepathSkillPool: null, traitPool: null, resourcePoints: null },
        flags: { isBorn: true, isGSPMultipliedByYear: false, isLSPMultipliedByYear: false, isRPMultipliedByYear: false, getHalfGSPFromPrevLP: false, getHalfLSPFromPrevLP: false, getHalfRPFromPrevLP: false },
        skills: [skillId],
        traits: [traitId],
        requirements: [{
          logicType: [1 as unknown as dat.LogicTypeId, "AND"],
          mustFulfill: true,
          fulfillmentAmount: null,
          items: [
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "setting"], setting: [settingId, "Home"] },
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "lifepath"], lifepath: [lifepathId, "Farmer"] },
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "skill"], skill: [skillId, "Sword"] },
            { logicType: [1 as unknown as dat.RequirementItemTypeId, "trait"], trait: [traitId, "Brave"] }
          ]
        }]
      };

      useRulesetStore.setState({ fetchState: "fetch-data" });
      MockFetchResponse(true, {
        ruleset: { ...EmptyRulesetData(), settings: [setting], skills: [skill], traits: [trait], resources: [resource], lifepaths: [lifepath] }
      });

      useRulesetStore.getState().fetchData();

      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("done"));

      const state = useRulesetStore.getState();
      expect(state.skillCategories).toEqual(["Physical"]);
      expect(state.skillTypes).toEqual(["General"]);
      expect(state.traitCategories).toEqual(["General"]);
      expect(state.traitTypes).toEqual(["Character"]);
      expect(state.resourceTypes).toEqual(["Property"]);
      // every requirement item references an id present in this same fetch, so all four survive.
      expect(state.lifepaths[0].requirements?.[0].items.length).toBe(4);
      // the lifepath's own skills/traits arrays are likewise kept since both ids survive the fetch.
      expect(state.lifepaths[0].skills).toEqual([skillId]);
      expect(state.lifepaths[0].traits).toEqual([traitId]);
    });

    it("ignores a stale successful response once its request has been superseded/aborted", async () => {
      // A second fetchData() call aborts the first's controller (FetchDataController?.abort()) --
      // when the first request's fetch promise still resolves afterward, its .then must see
      // signal.aborted and bail out without touching state, rather than overwriting the newer call.
      let resolveFirst!: (value: { ok: boolean; status: number; json: () => Promise<unknown>; }) => void;
      const firstResponse = new Promise(resolve => { resolveFirst = resolve; });
      const fetchMock = vi.fn()
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ ruleset: EmptyRulesetData() }) });
      vi.stubGlobal("fetch", fetchMock);

      useRulesetStore.setState({ fetchState: "fetch-data" });
      useRulesetStore.getState().fetchData();
      useRulesetStore.getState().fetchData();

      resolveFirst({ ok: true, status: 200, json: () => Promise.resolve({ ruleset: { ...EmptyRulesetData(), abilities: [Ability({ name: "StaleAbility" })] } }) });

      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("done"));
      expect(useRulesetStore.getState().abilities.some(a => a.name === "StaleAbility")).toBe(false);
    });

    it("ignores a stale failed response once its request has been superseded/aborted", async () => {
      let rejectFirst!: (reason: unknown) => void;
      const firstResponse = new Promise((_resolve, reject) => { rejectFirst = reject; });
      const fetchMock = vi.fn()
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ ruleset: EmptyRulesetData() }) });
      vi.stubGlobal("fetch", fetchMock);

      useRulesetStore.setState({ fetchState: "fetch-data" });
      useRulesetStore.getState().fetchData();
      useRulesetStore.getState().fetchData();

      rejectFirst(new Error("stale failure"));

      await vi.waitFor(() => expect(useRulesetStore.getState().fetchState).toBe("done"));
    });
  });

  describe("serveResult / serveIndexedResult", () => {
    it("returns the single matching row", () => {
      expect(useRulesetStore.getState().serveResult([1], ["x", "things"])).toBe(1);
    });

    it("throws when multiple rows match a name search", () => {
      expect(() => useRulesetStore.getState().serveResult([1, 2], ["x", "things"])).toThrow("Found multiple things rows with name 'x'");
    });

    it("throws when multiple rows match an id search", () => {
      expect(() => useRulesetStore.getState().serveResult([1, 2], [5, "things"])).toThrow("Found multiple things rows with id '5'");
    });

    it("throws when no rows match an id search", () => {
      expect(() => useRulesetStore.getState().serveResult([], [5, "things"])).toThrow("Could not find any things with id '5'");
    });

    it("serveIndexedResult returns the row for a known id and throws for an unknown one", () => {
      const byId = new Map([[1, "found"]]);
      expect(useRulesetStore.getState().serveIndexedResult(byId, 1, "things")).toBe("found");
      expect(() => useRulesetStore.getState().serveIndexedResult(byId, 2, "things")).toThrow("Could not find any things with id '2'");
    });
  });

  describe("getAbility (representative of the getX-by-id-or-name family)", () => {
    it("looks up by id via the indexed map", () => {
      const ability = Ability();
      useRulesetStore.setState({ abilities: [ability], abilitiesById: new Map([[ability.id!, ability]]) });
      expect(useRulesetStore.getState().getAbility(ability.id!)).toEqual(ability);
    });

    it("looks up by name via a linear scan", () => {
      const ability = Ability({ name: "Speed" });
      useRulesetStore.setState({ abilities: [ability] });
      expect(useRulesetStore.getState().getAbility("Speed")).toEqual(ability);
    });

    it("throws when the name isn't found", () => {
      useRulesetStore.setState({ abilities: [] });
      expect(() => useRulesetStore.getState().getAbility("Nope")).toThrow();
    });
  });

  describe("getStock/getSetting/getSkill/getTrait/getLifepath/getResource (id-or-name via indexed map)", () => {
    it("getStock looks up by id and by name", () => {
      const stock = { id: 1 as unknown as dat.StockId, name: "Dwarf" } as Stock;
      useRulesetStore.setState({ stocks: [stock], stocksById: new Map([[stock.id!, stock]]) });
      expect(useRulesetStore.getState().getStock(stock.id!)).toEqual(stock);
      expect(useRulesetStore.getState().getStock("Dwarf")).toEqual(stock);
    });

    it("getSetting looks up by id and by name", () => {
      const setting = { id: 1 as unknown as dat.SettingId, name: "Home" } as Setting;
      useRulesetStore.setState({ settings: [setting], settingsById: new Map([[setting.id!, setting]]) });
      expect(useRulesetStore.getState().getSetting(setting.id!)).toEqual(setting);
      expect(useRulesetStore.getState().getSetting("Home")).toEqual(setting);
    });

    it("getSkill looks up by id and by name", () => {
      const skill = { id: 1 as unknown as dat.SkillId, name: "Sword" } as Skill;
      useRulesetStore.setState({ skills: [skill], skillsById: new Map([[skill.id!, skill]]) });
      expect(useRulesetStore.getState().getSkill(skill.id!)).toEqual(skill);
      expect(useRulesetStore.getState().getSkill("Sword")).toEqual(skill);
    });

    it("getTrait looks up by id and by name", () => {
      const trait = { id: 1 as unknown as dat.TraitId, name: "Brave" } as Trait;
      useRulesetStore.setState({ traits: [trait], traitsById: new Map([[trait.id!, trait]]) });
      expect(useRulesetStore.getState().getTrait(trait.id!)).toEqual(trait);
      expect(useRulesetStore.getState().getTrait("Brave")).toEqual(trait);
    });

    it("getLifepath looks up by id and by name", () => {
      const lifepath = { id: 1 as unknown as dat.LifepathId, name: "Farmer" } as Lifepath;
      useRulesetStore.setState({ lifepaths: [lifepath], lifepathsById: new Map([[lifepath.id!, lifepath]]) });
      expect(useRulesetStore.getState().getLifepath(lifepath.id!)).toEqual(lifepath);
      expect(useRulesetStore.getState().getLifepath("Farmer")).toEqual(lifepath);
    });

    it("getResource looks up by id and by name", () => {
      const resource = { id: 1 as unknown as dat.ResourceId, name: "Sword" } as Resource;
      useRulesetStore.setState({ resources: [resource], resourcesById: new Map([[resource.id, resource]]) });
      expect(useRulesetStore.getState().getResource(resource.id)).toEqual(resource);
      expect(useRulesetStore.getState().getResource("Sword")).toEqual(resource);
    });
  });

  describe("getDoWAction/getRaCAction/getFightAction (id-or-name via linear filter)", () => {
    it("getDoWAction looks up by id and by name", () => {
      const action = { id: 1 as unknown as dat.DuelOfWitsActionId, name: "Charge" } as DoWAction;
      useRulesetStore.setState({ dowActions: [action] });
      expect(useRulesetStore.getState().getDoWAction(action.id)).toEqual(action);
      expect(useRulesetStore.getState().getDoWAction("Charge")).toEqual(action);
    });

    it("getRaCAction looks up by id and by name", () => {
      const action = { id: 1 as unknown as dat.RangeAndCoverActionId, name: "Snipe" } as RaCAction;
      useRulesetStore.setState({ racActions: [action] });
      expect(useRulesetStore.getState().getRaCAction(action.id!)).toEqual(action);
      expect(useRulesetStore.getState().getRaCAction("Snipe")).toEqual(action);
    });

    it("getFightAction looks up by id and by name", () => {
      const action = { id: 1 as unknown as dat.FightActionId, name: "Strike" } as FightAction;
      useRulesetStore.setState({ fightActions: [action] });
      expect(useRulesetStore.getState().getFightAction(action.id!)).toEqual(action);
      expect(useRulesetStore.getState().getFightAction("Strike")).toEqual(action);
    });
  });

  describe("getPractice", () => {
    it("looks up a practice by its string id", () => {
      const practice = { id: "prac-1" } as Practice;
      useRulesetStore.setState({ practices: [practice] });
      expect(useRulesetStore.getState().getPractice("prac-1")).toEqual(practice);
    });
  });

  describe("toggleDataset", () => {
    it("switches to a single non-expansion ruleset", () => {
      useRulesetStore.setState({
        rulesets: [{ id: "core" as unknown as dat.RulesetId, name: "Core", isOfficial: true, isPublic: true, isExpansion: false }],
        chosenRulesets: ["old" as unknown as dat.RulesetId],
        fetchState: "done"
      });

      useRulesetStore.getState().toggleDataset("core" as unknown as dat.RulesetId);

      const state = useRulesetStore.getState();
      expect(state.chosenRulesets).toEqual(["core"]);
      expect(state.fetchState).toBe("fetch-data");
    });

    it("removes an already-chosen expansion when more than one is chosen", () => {
      useRulesetStore.setState({
        rulesets: [{ id: "exp" as unknown as dat.RulesetId, name: "Exp", isOfficial: true, isPublic: true, isExpansion: true }],
        chosenRulesets: ["core" as unknown as dat.RulesetId, "exp" as unknown as dat.RulesetId],
        fetchState: "done"
      });

      useRulesetStore.getState().toggleDataset("exp" as unknown as dat.RulesetId);

      expect(useRulesetStore.getState().chosenRulesets).toEqual(["core"]);
    });

    it("removes the last chosen expansion, leaving no expansions chosen", () => {
      // Only the base (non-expansion) ruleset must always have exactly one chosen -- that invariant
      // is enforced entirely by the non-expansion branch above, which always replaces the selection
      // with a singleton. Expansions are free to go down to zero.
      useRulesetStore.setState({
        rulesets: [{ id: "exp" as unknown as dat.RulesetId, name: "Exp", isOfficial: true, isPublic: true, isExpansion: true }],
        chosenRulesets: ["exp" as unknown as dat.RulesetId],
        fetchState: "done"
      });

      useRulesetStore.getState().toggleDataset("exp" as unknown as dat.RulesetId);

      expect(useRulesetStore.getState().chosenRulesets).toEqual([]);
    });

    it("adds a new expansion to the chosen set", () => {
      useRulesetStore.setState({
        rulesets: [{ id: "exp2" as unknown as dat.RulesetId, name: "Exp2", isOfficial: true, isPublic: true, isExpansion: true }],
        chosenRulesets: ["core" as unknown as dat.RulesetId],
        fetchState: "done"
      });

      useRulesetStore.getState().toggleDataset("exp2" as unknown as dat.RulesetId);

      expect(useRulesetStore.getState().chosenRulesets).toEqual(["core", "exp2"]);
    });
  });

  describe("applyChosenRulesets / checkRulesets / checkExactRulesets", () => {
    it("applyChosenRulesets replaces the selection and moves to fetch-data", () => {
      useRulesetStore.getState().applyChosenRulesets(["a" as unknown as dat.RulesetId, "b" as unknown as dat.RulesetId]);
      const state = useRulesetStore.getState();
      expect(state.chosenRulesets).toEqual(["a", "b"]);
      expect(state.fetchState).toBe("fetch-data");
    });

    it("checkRulesets is true when any chosen ruleset is allowed", () => {
      useRulesetStore.setState({ chosenRulesets: ["a" as unknown as dat.RulesetId, "b" as unknown as dat.RulesetId] });
      expect(useRulesetStore.getState().checkRulesets(["b" as unknown as dat.RulesetId])).toBe(true);
      expect(useRulesetStore.getState().checkRulesets(["c" as unknown as dat.RulesetId])).toBe(false);
    });

    it("checkExactRulesets is true only when every allowed ruleset is chosen", () => {
      useRulesetStore.setState({ chosenRulesets: ["a" as unknown as dat.RulesetId, "b" as unknown as dat.RulesetId] });
      expect(useRulesetStore.getState().checkExactRulesets(["a" as unknown as dat.RulesetId, "b" as unknown as dat.RulesetId])).toBe(true);
      expect(useRulesetStore.getState().checkExactRulesets(["a" as unknown as dat.RulesetId, "c" as unknown as dat.RulesetId])).toBe(false);
    });
  });
});
