import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetRulesets } from "../../../api/src/services/rulesets.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseRow(overrides: Partial<dat.RulesetsList> = {}): dat.RulesetsList {
  return {
    id: 1 as unknown as dat.RulesetId,
    name: "Core",
    isOfficial: true,
    isPublic: true,
    isExpansion: false,
    expansionIds: null,
    ...overrides
  } as unknown as dat.RulesetsList;
}

function MockQueryResult(rows: dat.RulesetsList[]): void {
  vi.mocked(PgPool.query).mockResolvedValueOnce({ rows } as never);
}

describe("GetRulesets", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("omits expansionIds when unset", async () => {
    MockQueryResult([BaseRow()]);
    const result = await GetRulesets();
    expect(result[0].expansionIds).toBeUndefined();
  });

  it("includes expansionIds when populated", async () => {
    MockQueryResult([BaseRow({ expansionIds: [2 as unknown as dat.RulesetId] })]);
    const result = await GetRulesets();
    expect(result[0].expansionIds).toEqual([2]);
  });
});
