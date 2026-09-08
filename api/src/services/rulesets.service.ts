import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


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

  const query = "select * from dat.\"RulesetsList\";";
  return Timed("GetRulesets Querying", () => PgPool.query<dat.RulesetsList>(query)).then(result =>
    Timed("GetRulesets Conversion", () => result.rows.map(convert))
  );
}
