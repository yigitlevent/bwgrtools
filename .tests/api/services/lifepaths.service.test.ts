import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetLifepaths } from "../../../api/src/services/lifepaths.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseRow(overrides: Partial<dat.LifepathsList> = {}): dat.LifepathsList {
  return {
    rulesets: ["core"],
    id: 1 as unknown as dat.LifepathId,
    name: "Farmer",
    stockId: 1 as unknown as dat.StockId,
    stock: "Human",
    settingId: 1 as unknown as dat.SettingId,
    setting: "Farm",
    years: [5],
    eitherPool: 1,
    mentalPool: 1,
    physicalPool: 1,
    generalSkillPool: 1,
    lifepathSkillPool: 1,
    traitPool: 1,
    resourcePoints: 1,
    born: true,
    isGspMultiplier: false,
    isLspMultiplier: false,
    isRpMultiplier: false,
    halfGspFromPrev: false,
    halfLspFromPrev: false,
    halfRpFromPrev: false,
    leadIds: null,
    skillIds: null,
    traitIds: null,
    companionName: null,
    companionGivesSkills: null,
    companionSettingIds: null,
    companionGspMultiplier: null,
    companionLspMultiplier: null,
    companionRpMultiplier: null,
    requirementText: null,
    ...overrides
  } as unknown as dat.LifepathsList;
}

function MockQueryResults(lifepaths: dat.LifepathsList[], reqBlocks: dat.LifepathRequirementBlock[] = [], reqItems: dat.LifepathRequirementBlockItem[] = []): void {
  // The real view always returns a rulesets array (or null for ruleset-agnostic items), but fixtures
  // above only set it when a test cares about ruleset filtering -- default it here to keep those terse.
  const reqItemsWithRulesets = reqItems.map(item => ({ ...item, rulesets: item.rulesets ?? null }));

  vi.mocked(PgPool.query)
    .mockResolvedValueOnce({ rows: lifepaths } as never)
    .mockResolvedValueOnce({ rows: reqBlocks } as never)
    .mockResolvedValueOnce({ rows: reqItemsWithRulesets } as never);
}

describe("GetLifepaths", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("converts a single fixed-year lifepath to a scalar years value", async () => {
    MockQueryResults([BaseRow({ years: [5] })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].years).toBe(5);
  });

  it("keeps a variable-year lifepath as an array", async () => {
    MockQueryResults([BaseRow({ years: [1, 10] })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].years).toEqual([1, 10]);
  });

  it("treats a null years column as an empty array", async () => {
    MockQueryResults([BaseRow({ years: null })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].years).toEqual([]);
  });

  it("omits leads/skills/traits when their id arrays are empty or null", async () => {
    MockQueryResults([BaseRow({ leadIds: [], skillIds: null, traitIds: null })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].leads).toBeUndefined();
    expect(result[0].skills).toBeUndefined();
    expect(result[0].traits).toBeUndefined();
  });

  it("includes leads/skills/traits when populated", async () => {
    const leadIds = [2 as unknown as dat.SettingId];
    const skillIds = [3 as unknown as dat.SkillId];
    const traitIds = [4 as unknown as dat.TraitId];
    MockQueryResults([BaseRow({ leadIds, skillIds, traitIds })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].leads).toEqual(leadIds);
    expect(result[0].skills).toEqual(skillIds);
    expect(result[0].traits).toEqual(traitIds);
  });

  it("builds a companion block only when name, givesSkills, and settingIds are all present", async () => {
    MockQueryResults([BaseRow({ companionName: "Squire", companionGivesSkills: true, companionSettingIds: [1 as unknown as dat.SettingId] })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].companion).toEqual({ name: "Squire", givesSkills: true, settingIds: [1] });
  });

  it("omits the companion block when companionSettingIds is empty", async () => {
    MockQueryResults([BaseRow({ companionName: "Squire", companionGivesSkills: true, companionSettingIds: [] })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].companion).toBeUndefined();
  });

  it("includes companion inherit multipliers only when positive", async () => {
    MockQueryResults([BaseRow({
      companionName: "Squire", companionGivesSkills: true, companionSettingIds: [1 as unknown as dat.SettingId],
      companionGspMultiplier: 2, companionLspMultiplier: 0, companionRpMultiplier: -1
    })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].companion?.inheritGSPMultiplier).toBe(2);
    expect(result[0].companion?.inheritLSPMultiplier).toBeUndefined();
    expect(result[0].companion?.inheritRPMultiplier).toBeUndefined();
  });

  it("includes inheritLSPMultiplier and inheritRPMultiplier when positive", async () => {
    MockQueryResults([BaseRow({
      companionName: "Squire", companionGivesSkills: true, companionSettingIds: [1 as unknown as dat.SettingId],
      companionGspMultiplier: 0, companionLspMultiplier: 3, companionRpMultiplier: 4
    })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].companion?.inheritLSPMultiplier).toBe(3);
    expect(result[0].companion?.inheritRPMultiplier).toBe(4);
  });

  it("includes requirementsText only when set", async () => {
    MockQueryResults([BaseRow({ requirementText: "Must be Human" })]);
    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].requirementsText).toBe("Must be Human");
  });

  it("attaches requirement blocks matching the lifepath id, each with their own items", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;

    const reqBlock = {
      id: blockId,
      lifepathId,
      logicTypeId: 1 as unknown as dat.LogicTypeId,
      logicType: "AND",
      mustFulfill: true,
      fulfillmentAmount: null
    } as unknown as dat.LifepathRequirementBlock;

    const reqItem = {
      requirementId: blockId,
      requirementTypeId: 1 as unknown as dat.RequirementItemTypeId,
      requirementType: "UNIQUE",
      min: null,
      max: null
    } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [reqItem]);

    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);

    expect(result[0].requirements).toEqual([{
      logicType: [1, "AND"],
      mustFulfill: true,
      fulfillmentAmount: null,
      items: [{ logicType: [1, "UNIQUE"], isUnique: true }]
    }]);
  });

  it("maps each requirement item type to its dedicated shape", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "OR", mustFulfill: false, fulfillmentAmount: 1 } as unknown as dat.LifepathRequirementBlock;

    const items = [
      { requirementId: blockId, requirementTypeId: 1, requirementType: "SETTINGENTRY" },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "LPINDEX", min: 2, max: null },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "LPINDEX", min: null, max: 5 },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "YEARS", min: 10, max: null },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "YEARS", min: null, max: 20 },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "FEMALE" },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "MALE" },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "OLDESTBY", max: 3 },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "ATTRIBUTE", attributeId: 5, attribute: "Will", min: 3, forCompanion: false },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "ATTRIBUTE", attributeId: 5, attribute: "Will", max: 7, forCompanion: false },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "SKILL", skillId: 6, skill: "Sword", forCompanion: false },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "TRAIT", traitId: 7, trait: "Brave", forCompanion: false },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "LIFEPATH", lifepathId: 8, lifepath: "Soldier", forCompanion: false },
      { requirementId: blockId, requirementTypeId: 1, requirementType: "SETTING", settingId: 9, setting: "Town", forCompanion: false }
    ] as unknown as dat.LifepathRequirementBlockItem[];

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], items);

    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    const mapped = result[0].requirements?.[0].items;

    expect(mapped).toEqual([
      { logicType: [1, "SETTINGENTRY"], isSettingEntry: true },
      { logicType: [1, "LPINDEX"], minLpIndex: 2 },
      { logicType: [1, "LPINDEX"], maxLpIndex: 5 },
      { logicType: [1, "YEARS"], minYears: 10 },
      { logicType: [1, "YEARS"], maxYears: 20 },
      { logicType: [1, "FEMALE"], gender: "Female" },
      { logicType: [1, "MALE"], gender: "Male" },
      { logicType: [1, "OLDESTBY"], oldestBy: 3 },
      { logicType: [1, "ATTRIBUTE"], attribute: [5, "Will"], forCompanion: false, min: 3 },
      { logicType: [1, "ATTRIBUTE"], attribute: [5, "Will"], forCompanion: false, max: 7 },
      { logicType: [1, "SKILL"], skill: [6, "Sword"], forCompanion: false },
      { logicType: [1, "TRAIT"], trait: [7, "Brave"], forCompanion: false },
      { logicType: [1, "LIFEPATH"], lifepath: [8, "Soldier"], forCompanion: false },
      { logicType: [1, "SETTING"], setting: [9, "Town"], forCompanion: false }
    ]);
  });

  it("throws for a LPINDEX item missing both min and max", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = { requirementId: blockId, requirementTypeId: 1, requirementType: "LPINDEX", min: null, max: null } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    await expect(GetLifepaths([1 as unknown as dat.RulesetId])).rejects.toThrow("max value must be set for LPINDEX requirement type");
  });

  it("throws for a YEARS item missing both min and max", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = { requirementId: blockId, requirementTypeId: 1, requirementType: "YEARS", min: null, max: null } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    await expect(GetLifepaths([1 as unknown as dat.RulesetId])).rejects.toThrow("max value must be set for YEARS requirement type");
  });

  it("throws for an OLDESTBY item missing max", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = { requirementId: blockId, requirementTypeId: 1, requirementType: "OLDESTBY", max: null } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    await expect(GetLifepaths([1 as unknown as dat.RulesetId])).rejects.toThrow("max value must be set for OLDESTBY requirement type");
  });

  it("throws for an unidentified requirement item type", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = { requirementId: blockId, requirementTypeId: 1, requirementType: "UNKNOWN_TYPE" } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    await expect(GetLifepaths([1 as unknown as dat.RulesetId])).rejects.toThrow("unidentified requirement block item type");
  });

  it("falls back to the literal string \"null\" in the error message when requirementType is null", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = { requirementId: blockId, requirementTypeId: 1, requirementType: null } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    await expect(GetLifepaths([1 as unknown as dat.RulesetId])).rejects.toThrow("unidentified requirement block item type: null");
  });

  it("omits min/max on an ATTRIBUTE item when both are explicitly null", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = {
      requirementId: blockId, requirementTypeId: 1, requirementType: "ATTRIBUTE",
      attributeId: 5, attribute: "Will", min: null, max: null, forCompanion: false
    } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].requirements?.[0].items).toEqual([{ logicType: [1, "ATTRIBUTE"], attribute: [5, "Will"], forCompanion: false }]);
  });

  it("includes both min and max on an ATTRIBUTE item when both are set", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = {
      requirementId: blockId, requirementTypeId: 1, requirementType: "ATTRIBUTE",
      attributeId: 5, attribute: "Will", min: 3, max: 7, forCompanion: false
    } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    const result = await GetLifepaths([1 as unknown as dat.RulesetId]);
    expect(result[0].requirements?.[0].items).toEqual([{ logicType: [1, "ATTRIBUTE"], attribute: [5, "Will"], forCompanion: false, min: 3, max: 7 }]);
  });

  it("keeps a requirement item whose rulesets overlap with the active rulesets", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = {
      requirementId: blockId, requirementTypeId: 1, requirementType: "UNIQUE",
      rulesets: ["core"]
    } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    const result = await GetLifepaths(["core" as unknown as dat.RulesetId]);
    expect(result[0].requirements?.[0].items).toEqual([{ logicType: [1, "UNIQUE"], isUnique: true }]);
  });

  it("drops a requirement item whose rulesets don't overlap with the active rulesets", async () => {
    const lifepathId = 1 as unknown as dat.LifepathId;
    const blockId = 10 as unknown as dat.LifepathRequirementBlockId;
    const reqBlock = { id: blockId, lifepathId, logicTypeId: 1, logicType: "AND", mustFulfill: true, fulfillmentAmount: null } as unknown as dat.LifepathRequirementBlock;
    const item = {
      requirementId: blockId, requirementTypeId: 1, requirementType: "UNIQUE",
      rulesets: ["expansion"]
    } as unknown as dat.LifepathRequirementBlockItem;

    MockQueryResults([BaseRow({ id: lifepathId })], [reqBlock], [item]);

    const result = await GetLifepaths(["core" as unknown as dat.RulesetId]);
    expect(result[0].requirements).toBeUndefined();
  });
});
