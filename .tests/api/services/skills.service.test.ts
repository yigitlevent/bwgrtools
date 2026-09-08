import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetSkills } from "../../../api/src/services/skills.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseRow(overrides: Partial<dat.SkillsList> = {}): dat.SkillsList {
  return {
    rulesets: ["core"],
    id: 1 as unknown as dat.SkillId,
    name: "Sword",
    categoryId: 1 as unknown as dat.SkillCategoryId,
    category: "Combat",
    typeId: 1 as unknown as dat.SkillTypeId,
    type: "General",
    dontList: false,
    isMagical: false,
    isTraining: false,
    toolTypeId: 1 as unknown as dat.SkillToolTypeId,
    tool: "Weapon",
    stockId: null,
    stock: null,
    rootIds: null,
    roots: null,
    toolDescription: null,
    description: null,
    subskillIds: null,
    restrictionOnlyStockId: null,
    restrictionOnlyStock: null,
    restrictionWhenBurning: null,
    restrictionAbilityId: null,
    restrictionAbility: null,
    ...overrides
  } as unknown as dat.SkillsList;
}

function MockQueryResult(rows: dat.SkillsList[]): void {
  vi.mocked(PgPool.query).mockResolvedValueOnce({ rows } as never);
}

describe("GetSkills", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("omits stock when stockId or stock is null", async () => {
    MockQueryResult([BaseRow({ stockId: null, stock: null })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].stock).toBeUndefined();
  });

  it("includes stock when both stockId and stock are present", async () => {
    MockQueryResult([BaseRow({ stockId: 2 as unknown as dat.StockId, stock: "Dwarf" })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].stock).toEqual([2, "Dwarf"]);
  });

  it("zips rootIds with roots names", async () => {
    MockQueryResult([BaseRow({ rootIds: [1 as unknown as dat.AbilityId, 2 as unknown as dat.AbilityId], roots: ["Will", "Forte"] })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].roots).toEqual([[1, "Will"], [2, "Forte"]]);
  });

  it("omits roots when rootIds is empty", async () => {
    MockQueryResult([BaseRow({ rootIds: [], roots: [] })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].roots).toBeUndefined();
  });

  it("treats a null roots names column as an empty array when zipping", async () => {
    MockQueryResult([BaseRow({ rootIds: [1 as unknown as dat.AbilityId], roots: null })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].roots).toEqual([[1, undefined]]);
  });

  it("includes tool description only when present", async () => {
    MockQueryResult([BaseRow({ toolDescription: "A sharp blade" })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].tool.description).toBe("A sharp blade");
  });

  it("omits tool description when null", async () => {
    MockQueryResult([BaseRow({ toolDescription: null })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].tool.description).toBeUndefined();
  });

  it("includes description only when present", async () => {
    MockQueryResult([BaseRow({ description: "A basic bladed weapon skill" })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].description).toBe("A basic bladed weapon skill");
  });

  it("omits description when null", async () => {
    MockQueryResult([BaseRow({ description: null })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].description).toBeUndefined();
  });

  it("includes subskillIds only when non-empty", async () => {
    MockQueryResult([BaseRow({ subskillIds: [] })]);
    const empty = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(empty[0].subskillIds).toBeUndefined();

    MockQueryResult([BaseRow({ subskillIds: [5 as unknown as dat.SkillId] })]);
    const populated = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(populated[0].subskillIds).toEqual([5]);
  });

  it("builds a restriction block only when restrictionOnlyStockId/Stock are both set", async () => {
    MockQueryResult([BaseRow({ restrictionOnlyStockId: null, restrictionOnlyStock: null })]);
    const none = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(none[0].restriction).toBeUndefined();

    MockQueryResult([BaseRow({
      restrictionOnlyStockId: 3 as unknown as dat.StockId, restrictionOnlyStock: "Orc",
      restrictionWhenBurning: true,
      restrictionAbilityId: 4 as unknown as dat.AbilityId, restrictionAbility: "Power"
    })]);
    const full = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(full[0].restriction).toEqual({
      onlyStock: [3, "Orc"],
      onlyAtBurn: true,
      onlyWithAbility: [4, "Power"]
    });
  });

  it("omits onlyAtBurn/onlyWithAbility when their fields are null", async () => {
    MockQueryResult([BaseRow({
      restrictionOnlyStockId: 3 as unknown as dat.StockId, restrictionOnlyStock: "Orc",
      restrictionWhenBurning: null, restrictionAbilityId: null, restrictionAbility: null
    })]);
    const result = await GetSkills([1 as unknown as dat.RulesetId]);
    expect(result[0].restriction).toEqual({ onlyStock: [3, "Orc"] });
  });
});
