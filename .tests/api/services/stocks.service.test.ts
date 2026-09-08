import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetStocks } from "../../../api/src/services/stocks.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseRow(overrides: Partial<dat.StocksList> = {}): dat.StocksList {
  return {
    rulesets: ["core"],
    id: 1 as unknown as dat.StockId,
    name: "Human",
    namePlural: "Humans",
    stride: 6,
    settingIds: [],
    ...overrides
  } as unknown as dat.StocksList;
}

function MockQueryResults(stocks: dat.StocksList[], agePools: dat.AgePool[] = []): void {
  vi.mocked(PgPool.query)
    .mockResolvedValueOnce({ rows: stocks } as never)
    .mockResolvedValueOnce({ rows: agePools } as never);
}

describe("GetStocks", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("attaches only the age pools matching the stock id", async () => {
    const stockId = 1 as unknown as dat.StockId;
    const otherStockId = 2 as unknown as dat.StockId;
    const agePools = [
      { stockId, minAge: 0, mentalPool: 10, physicalPool: 10 },
      { stockId: otherStockId, minAge: 0, mentalPool: 5, physicalPool: 5 }
    ] as unknown as dat.AgePool[];

    MockQueryResults([BaseRow({ id: stockId })], agePools);
    const result = await GetStocks([1 as unknown as dat.RulesetId]);

    expect(result[0].agePool).toEqual([{ minAge: 0, mentalPool: 10, physicalPool: 10 }]);
  });

  it("returns an empty agePool array when none match", async () => {
    MockQueryResults([BaseRow()], []);
    const result = await GetStocks([1 as unknown as dat.RulesetId]);
    expect(result[0].agePool).toEqual([]);
  });
});
