import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetResources } from "../../../api/src/services/resources.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseRow(overrides: Partial<dat.ResourcesList> = {}): dat.ResourcesList {
  return {
    rulesets: ["core"],
    id: 1 as unknown as dat.ResourceId,
    name: "Sword",
    stockId: 1 as unknown as dat.StockId,
    stock: "Human",
    resourceTypeId: 1 as unknown as dat.ResourceTypeId,
    resourceType: "Property",
    costs: [10],
    costDescriptions: ["base"],
    modifiers: [],
    modifierIsPerCosts: [],
    modifierDescriptions: [],
    variableCost: null,
    description: null,
    ...overrides
  } as unknown as dat.ResourcesList;
}

function MockQueryResults(resources: dat.ResourcesList[], magicDetails: dat.ResourceMagicDetailsList[] = [], magicObstacles: dat.ResourceMagicObstaclesList[] = []): void {
  vi.mocked(PgPool.query)
    .mockResolvedValueOnce({ rows: resources } as never)
    .mockResolvedValueOnce({ rows: magicDetails } as never)
    .mockResolvedValueOnce({ rows: magicObstacles } as never);
}

describe("GetResources", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("converts basic fields and zips costs with their descriptions", async () => {
    MockQueryResults([BaseRow({ costs: [10, 20], costDescriptions: ["base", "upgraded"] })]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result[0].costs).toEqual([[10, "base"], [20, "upgraded"]]);
  });

  it("zips modifiers with per-cost flags and descriptions", async () => {
    MockQueryResults([BaseRow({ modifiers: [5, 2], modifierIsPerCosts: [false, true], modifierDescriptions: ["Flat", "Per Weapon"] })]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result[0].modifiers).toEqual([[5, false, "Flat"], [2, true, "Per Weapon"]]);
  });

  it("treats a null costs/modifiers column as an empty array (skipping the forEach entirely)", async () => {
    MockQueryResults([BaseRow({ costs: null, costDescriptions: null, modifiers: null, modifierIsPerCosts: null, modifierDescriptions: null })]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result[0].costs).toEqual([]);
    expect(result[0].modifiers).toEqual([]);
  });

  it("treats null costDescriptions/modifierIsPerCosts/modifierDescriptions as empty arrays while zipping populated costs/modifiers", async () => {
    MockQueryResults([BaseRow({ costs: [10], costDescriptions: null, modifiers: [5], modifierIsPerCosts: null, modifierDescriptions: null })]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result[0].costs).toEqual([[10, undefined]]);
    expect(result[0].modifiers).toEqual([[5, undefined, undefined]]);
  });

  it("includes description only when present", async () => {
    MockQueryResults([BaseRow({ description: "A trusty blade" })]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result[0].description).toBe("A trusty blade");
  });

  it("omits description when null", async () => {
    MockQueryResults([BaseRow({ description: null })]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result[0].description).toBeUndefined();
  });

  it("sets variableCost only when truthy", async () => {
    MockQueryResults([BaseRow({ variableCost: true })]);
    const result1 = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result1[0].variableCost).toBe(true);

    MockQueryResults([BaseRow({ variableCost: false })]);
    const result2 = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result2[0].variableCost).toBeUndefined();
  });

  it("omits magical details when no matching row exists", async () => {
    MockQueryResults([BaseRow()], []);
    const result = await GetResources([1 as unknown as dat.RulesetId]);
    expect(result[0].magical).toBeUndefined();
  });

  it("attaches magical details matching the resource id", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId,
      originId: 1, origin: "Self",
      durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single",
      actions: 2,
      actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null,
      areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: 1, element1: "Fire",
      element2Id: null, element2: null,
      element3Id: null, element3: null,
      impetus1Id: 1, impetus1: "Bolt",
      impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical).toEqual({
      origin: [1, "Self"],
      duration: [1, "Instant"],
      areaOfEffect: [1, "Single"],
      elements: [[1, "Fire"]],
      impetus: [[1, "Bolt"]],
      actions: 2,
      doActionsMultiply: false
    });
  });

  it("attaches a second and third element and a second impetus when present", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId,
      originId: 1, origin: "Self",
      durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single",
      actions: 2, actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null,
      areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: 1, element1: "Fire",
      element2Id: 2, element2: "Water",
      element3Id: 3, element3: "Air",
      impetus1Id: 1, impetus1: "Bolt",
      impetus2Id: 2, impetus2: "Wave"
    } as unknown as dat.ResourceMagicDetailsList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.elements).toEqual([[1, "Fire"], [2, "Water"], [3, "Air"]]);
    expect(result[0].magical?.impetus).toEqual([[1, "Bolt"], [2, "Wave"]]);
  });

  it("omits areaOfEffectDetails entirely when no unit or modifier column is set", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId, originId: 1, origin: "Self", durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single", actions: 1, actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null, areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: null, element1: null, element2Id: null, element2: null, element3Id: null, element3: null,
      impetus1Id: null, impetus1: null, impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.areaOfEffectDetails).toBeUndefined();
  });

  it("adds areaOfEffectDetails only when a unit or modifier is present", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId,
      originId: 1, origin: "Self",
      durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single",
      actions: 1, actionsMultiply: false,
      areaOfEffectModifierId: 2, areaOfEffectModifier: "Per Yard",
      areaOfEffectUnitId: 3, areaOfEffectUnit: "Yards",
      element1Id: null, element1: null, element2Id: null, element2: null, element3Id: null, element3: null,
      impetus1Id: null, impetus1: null, impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.areaOfEffectDetails).toEqual({
      unit: [3, "Yards"],
      modifier: [2, "Per Yard"]
    });
  });

  it("attaches obstacle details with a fixed obstacle number", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId, originId: 1, origin: "Self", durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single", actions: 1, actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null, areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: null, element1: null, element2Id: null, element2: null, element3Id: null, element3: null,
      impetus1Id: null, impetus1: null, impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    const obstacle = {
      resourceId, obstacle: 5, obstacleCaret: true, description: "vs will",
      obstacleAbility1Id: null, obstacleAbility1: null, obstacleAbility2Id: null, obstacleAbility2: null
    } as unknown as dat.ResourceMagicObstaclesList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail], [obstacle]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.obstacleDetails).toEqual([{ obstacle: 5, caret: true, description: "vs will" }]);
  });

  it("omits caret and description from an obstacle detail when they are falsy/null", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId, originId: 1, origin: "Self", durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single", actions: 1, actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null, areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: null, element1: null, element2Id: null, element2: null, element3Id: null, element3: null,
      impetus1Id: null, impetus1: null, impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    const obstacle = {
      resourceId, obstacle: 5, obstacleCaret: false, description: null,
      obstacleAbility1Id: null, obstacleAbility1: null, obstacleAbility2Id: null, obstacleAbility2: null
    } as unknown as dat.ResourceMagicObstaclesList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail], [obstacle]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.obstacleDetails).toEqual([{ obstacle: 5 }]);
  });

  it("skips ability1 when its id is set but the name is missing, while ability2 is fully set", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId, originId: 1, origin: "Self", durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single", actions: 1, actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null, areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: null, element1: null, element2Id: null, element2: null, element3Id: null, element3: null,
      impetus1Id: null, impetus1: null, impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    const obstacle = {
      resourceId, obstacle: null, obstacleCaret: null, description: null,
      obstacleAbility1Id: 1, obstacleAbility1: null, obstacleAbility2Id: 2, obstacleAbility2: "Perception"
    } as unknown as dat.ResourceMagicObstaclesList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail], [obstacle]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.obstacleDetails).toEqual([{ abilities: [[2, "Perception"]] }]);
  });

  it("attaches only the first ability when only obstacleAbility1 is set", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId, originId: 1, origin: "Self", durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single", actions: 1, actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null, areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: null, element1: null, element2Id: null, element2: null, element3Id: null, element3: null,
      impetus1Id: null, impetus1: null, impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    const obstacle = {
      resourceId, obstacle: null, obstacleCaret: null, description: null,
      obstacleAbility1Id: 1, obstacleAbility1: "Will", obstacleAbility2Id: null, obstacleAbility2: null
    } as unknown as dat.ResourceMagicObstaclesList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail], [obstacle]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.obstacleDetails).toEqual([{ abilities: [[1, "Will"]] }]);
  });

  it("builds an empty obstacle detail when neither obstacle nor any ability is set", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId, originId: 1, origin: "Self", durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single", actions: 1, actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null, areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: null, element1: null, element2Id: null, element2: null, element3Id: null, element3: null,
      impetus1Id: null, impetus1: null, impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    const obstacle = {
      resourceId, obstacle: null, obstacleCaret: null, description: "vague",
      obstacleAbility1Id: null, obstacleAbility1: null, obstacleAbility2Id: null, obstacleAbility2: null
    } as unknown as dat.ResourceMagicObstaclesList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail], [obstacle]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.obstacleDetails).toEqual([{ description: "vague" }]);
  });

  it("attaches obstacle details via abilities when no fixed obstacle is set", async () => {
    const resourceId = 1 as unknown as dat.ResourceId;
    const magicDetail = {
      resourceId, originId: 1, origin: "Self", durationId: 1, duration: "Instant",
      areaOfEffectId: 1, areaOfEffect: "Single", actions: 1, actionsMultiply: false,
      areaOfEffectModifierId: null, areaOfEffectModifier: null, areaOfEffectUnitId: null, areaOfEffectUnit: null,
      element1Id: null, element1: null, element2Id: null, element2: null, element3Id: null, element3: null,
      impetus1Id: null, impetus1: null, impetus2Id: null, impetus2: null
    } as unknown as dat.ResourceMagicDetailsList;

    const obstacle = {
      resourceId, obstacle: null, obstacleCaret: null, description: null,
      obstacleAbility1Id: 1, obstacleAbility1: "Will", obstacleAbility2Id: 2, obstacleAbility2: "Perception"
    } as unknown as dat.ResourceMagicObstaclesList;

    MockQueryResults([BaseRow({ id: resourceId })], [magicDetail], [obstacle]);
    const result = await GetResources([1 as unknown as dat.RulesetId]);

    expect(result[0].magical?.obstacleDetails).toEqual([{ abilities: [[1, "Will"], [2, "Perception"]] }]);
  });
});
