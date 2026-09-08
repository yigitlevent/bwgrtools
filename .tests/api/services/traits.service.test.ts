import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetTraits } from "../../../api/src/services/traits.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseRow(overrides: Partial<dat.TraitsList> = {}): dat.TraitsList {
  return {
    rulesets: ["core"],
    id: 1 as unknown as dat.TraitId,
    name: "Brave",
    categoryId: 1 as unknown as dat.TraitCategoryId,
    category: "Character",
    typeId: 1 as unknown as dat.TraitTypeId,
    type: "General",
    cost: 1,
    stockId: null,
    stock: null,
    description: null,
    callOnSkillIds: null,
    callOnAbilityIds: null,
    grantsResourceIds: null,
    grantsResourceMinCosts: null,
    grantsResourceIsChoice: null,
    ...overrides
  } as unknown as dat.TraitsList;
}

function MockQueryResult(rows: dat.TraitsList[]): void {
  vi.mocked(PgPool.query).mockResolvedValueOnce({ rows } as never);
}

describe("GetTraits", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("omits stock when stockId or stock is null", async () => {
    MockQueryResult([BaseRow()]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].stock).toBeUndefined();
  });

  it("includes stock when both are set", async () => {
    MockQueryResult([BaseRow({ stockId: 2 as unknown as dat.StockId, stock: "Elf" })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].stock).toEqual([2, "Elf"]);
  });

  it("includes description only when present", async () => {
    MockQueryResult([BaseRow({ description: "Stands firm against fear" })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].description).toBe("Stands firm against fear");
  });

  it("omits description when null", async () => {
    MockQueryResult([BaseRow({ description: null })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].description).toBeUndefined();
  });

  it("omits callOnSkills/callOnAbilities when empty", async () => {
    MockQueryResult([BaseRow({ callOnSkillIds: [], callOnAbilityIds: [] })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].callOnSkills).toBeUndefined();
    expect(result[0].callOnAbilities).toBeUndefined();
  });

  it("includes callOnSkills/callOnAbilities when populated", async () => {
    MockQueryResult([BaseRow({ callOnSkillIds: [1 as unknown as dat.SkillId], callOnAbilityIds: [2 as unknown as dat.AbilityId] })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].callOnSkills).toEqual([1]);
    expect(result[0].callOnAbilities).toEqual([2]);
  });

  it("zips grantsResourceIds with their min costs and defaults isChoice to true", async () => {
    MockQueryResult([BaseRow({ grantsResourceIds: [1 as unknown as dat.ResourceId, 2 as unknown as dat.ResourceId], grantsResourceMinCosts: [10, 20], grantsResourceIsChoice: null })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].grantsResources).toEqual([{ resource: 1, minCost: 10 }, { resource: 2, minCost: 20 }]);
    expect(result[0].grantsResourcesIsChoice).toBe(true);
  });

  it("treats a null grantsResourceMinCosts column as an empty array when zipping", async () => {
    MockQueryResult([BaseRow({ grantsResourceIds: [1 as unknown as dat.ResourceId], grantsResourceMinCosts: null })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].grantsResources).toEqual([{ resource: 1, minCost: undefined }]);
  });

  it("respects an explicit grantsResourceIsChoice of false", async () => {
    MockQueryResult([BaseRow({ grantsResourceIds: [1 as unknown as dat.ResourceId], grantsResourceMinCosts: [10], grantsResourceIsChoice: false })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].grantsResourcesIsChoice).toBe(false);
  });

  it("omits grantsResources entirely when grantsResourceIds is empty", async () => {
    MockQueryResult([BaseRow({ grantsResourceIds: [] })]);
    const result = await GetTraits([1 as unknown as dat.RulesetId]);
    expect(result[0].grantsResources).toBeUndefined();
    expect(result[0].grantsResourcesIsChoice).toBeUndefined();
  });
});
