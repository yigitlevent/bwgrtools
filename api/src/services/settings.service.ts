import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetSettings(rulesets: dat.RulesetId[]): Promise<Setting[]> {
  const convert = (v: dat.SettingsList): Setting => {
    return {
      rulesets: v.rulesets,
      id: v.id,
      name: v.name,
      nameShort: v.nameShort,
      stock: [v.stockId, v.stockName!],
      isSubsetting: v.isSubsetting
    };
  };

  const log = new Logger("GetSettings Querying");
  const query = `select * from dat."SettingsList" where "rulesets"::text[] && ARRAY['${rulesets.join("','")}'];`;
  return PgPool.query<dat.SettingsList>(query).then(result => {
    log.end();
    const log2 = new Logger("GetSettings Conversion");
    const res = result.rows.map(convert);
    log2.end();
    return res;
  });
}
