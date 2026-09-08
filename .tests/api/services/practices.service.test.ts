import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetPractices } from "../../../api/src/services/practices.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function MockQueryResult(rows: dat.PracticeList[]): void {
  vi.mocked(PgPool.query).mockResolvedValueOnce({ rows } as never);
}

describe("GetPractices", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("builds an ability-based practice when ability/abilityId are set", async () => {
    MockQueryResult([{
      id: "p1", abilityId: 1, ability: "Will", skillTypeId: null, skillType: null,
      cycle: 7, routine: 1, difficult: 2, challenging: 3
    } as unknown as dat.PracticeList]);

    const result = await GetPractices();
    expect(result[0]).toEqual({ id: "p1", ability: [1, "Will"], cycle: 7, routine: 1, difficult: 2, challenging: 3 });
  });

  it("builds a skillType-based practice when skillType/skillTypeId are set", async () => {
    MockQueryResult([{
      id: "p2", abilityId: null, ability: null, skillTypeId: 2, skillType: "Combat",
      cycle: 7, routine: 1, difficult: 2, challenging: 3
    } as unknown as dat.PracticeList]);

    const result = await GetPractices();
    expect(result[0]).toEqual({ id: "p2", skillType: [2, "Combat"], cycle: 7, routine: 1, difficult: 2, challenging: 3 });
  });

  it("throws when neither ability nor skillType is set", async () => {
    MockQueryResult([{
      id: "p3", abilityId: null, ability: null, skillTypeId: null, skillType: null,
      cycle: 7, routine: 1, difficult: 2, challenging: 3
    } as unknown as dat.PracticeList]);

    await expect(GetPractices()).rejects.toThrow("shall not happen");
  });
});
