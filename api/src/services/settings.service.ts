import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


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

  const query = `select * from dat."SettingsList" where "rulesets"::text[] && ARRAY['${rulesets.join("','")}'];`;
  return Timed("GetSettings Querying", () => PgPool.query<dat.SettingsList>(query)).then(result =>
    Timed("GetSettings Conversion", () => result.rows.map(convert))
  );
}
