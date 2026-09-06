import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetRulesets(): Promise<Ruleset[]> {
  const convert = (v: dat.RulesetsList): Ruleset => {
    const r: Ruleset = {
      id: v.id,
      name: v.name,
      isOfficial: v.isOfficial,
      isPublic: v.isPublic,
      isExpansion: v.isExpansion
    };

    if (v.expansionIds && v.expansionIds.length > 0) r.expansionIds = v.expansionIds;
    if (v.user !== null) r.user = v.user;

    return r;
  };

  const log = new Logger("GetRulesets Querying");
  const query = "select * from dat.\"RulesetsList\";";
  return PgPool.query<dat.RulesetsList>(query).then(result => {
    log.end();
    const log2 = new Logger("GetRulesets Conversion");
    const res = result.rows.map(convert);
    log2.end();
    return res;
  });
}
