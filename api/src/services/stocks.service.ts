import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetStocks(rulesets: dat.RulesetId[]): Promise<Stock[]> {
  const convert = (v: dat.StocksList[], a: dat.AgePool[]): Stock[] => {
    const log = new Logger("GetStocks Conversion");

    const r = v.map(stock => {
      return {
        rulesets: stock.rulesets,
        id: stock.id,
        name: stock.name,
        namePlural: stock.namePlural,
        stride: stock.stride,
        settingIds: stock.settingIds,
        agePool: a.filter(ap => ap.stockId === stock.id).map(ap => ({ minAge: ap.minAge, mentalPool: ap.mentalPool, physicalPool: ap.physicalPool }))
      };
    });

    log.end();
    return r;
  };

  const log = new Logger("GetStocks Querying");
  const query1 = `select * from dat."StocksList" where "rulesets"::text[] && ARRAY['${rulesets.join("','")}'];`;
  const query2 = "select * from dat.\"AgePool\";";
  return Promise.all([
    PgPool.query<dat.StocksList>(query1),
    PgPool.query<dat.AgePool>(query2)
  ]).then(result => {
    log.end();
    const res = convert(result[0].rows, result[1].rows);
    return res;
  });
}
