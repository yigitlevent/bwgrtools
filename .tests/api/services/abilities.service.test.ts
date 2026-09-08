import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetAbilities } from "../../../api/src/services/abilities.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseRow(overrides: Partial<dat.AbilitiesList> = {}): dat.AbilitiesList {
  return {
    id: 1 as unknown as dat.AbilityId,
    name: "Will",
    abilityTypeId: 1 as unknown as dat.AbilityTypeId,
    abilityType: "Mental",
    hasShades: true,
    requiredTraitIds: null,
    cycle: null,
    routine: null,
    difficult: null,
    challenging: null,
    ...overrides
  } as unknown as dat.AbilitiesList;
}

function MockQueryResult(rows: dat.AbilitiesList[]): void {
  vi.mocked(PgPool.query).mockResolvedValueOnce({ rows } as never);
}

describe("GetAbilities", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("omits requiredTraits when empty", async () => {
    MockQueryResult([BaseRow({ requiredTraitIds: [] })]);
    const result = await GetAbilities();
    expect(result[0].requiredTraits).toBeUndefined();
  });

  it("includes requiredTraits when populated", async () => {
    MockQueryResult([BaseRow({ requiredTraitIds: [1 as unknown as dat.TraitId] })]);
    const result = await GetAbilities();
    expect(result[0].requiredTraits).toEqual([1]);
  });

  it("omits practice when any of the four fields is null", async () => {
    MockQueryResult([BaseRow({ cycle: 1, routine: 1, difficult: 1, challenging: null })]);
    const result = await GetAbilities();
    expect(result[0].practice).toBeUndefined();
  });

  it("includes practice only when all four fields are non-null", async () => {
    MockQueryResult([BaseRow({ cycle: 4, routine: 1, difficult: 2, challenging: 3 })]);
    const result = await GetAbilities();
    expect(result[0].practice).toEqual({ cycle: 4, routineTests: 1, difficultTests: 2, challengingTests: 3 });
  });
});
