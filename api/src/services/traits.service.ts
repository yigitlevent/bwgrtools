import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetTraits(rulesets: dat.RulesetId[]): Promise<Trait[]> {
  const convert = (v: dat.TraitsList): Trait => {
    const r: Trait = {
      rulesets: v.rulesets,
      id: v.id,
      name: v.name,
      category: [v.categoryId, v.category!],
      type: [v.typeId, v.type!],
      cost: v.cost
    };

    if (v.stockId !== null && v.stock !== null) r.stock = [v.stockId, v.stock];
    if (v.description !== null) r.description = v.description;

    return r;
  };

  const log = new Logger("GetTraits Querying");
  const query = `select * from dat."TraitsList" where "rulesets"::text[] && ARRAY['${rulesets.join("','")}'];`;
  return PgPool.query<dat.TraitsList>(query).then(result => {
    log.end();
    const log2 = new Logger("GetTraits Conversion");
    const res = result.rows.map(convert);
    log2.end();
    return res;
  });
}
