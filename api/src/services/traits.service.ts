import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


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
    if (v.callOnSkillIds && v.callOnSkillIds.length > 0) r.callOnSkills = v.callOnSkillIds;
    if (v.callOnAbilityIds && v.callOnAbilityIds.length > 0) r.callOnAbilities = v.callOnAbilityIds;
    if (v.grantsResourceIds && v.grantsResourceIds.length > 0) {
      r.grantsResources = v.grantsResourceIds.map((resource, i) => ({ resource, minCost: (v.grantsResourceMinCosts ?? [])[i] }));
    }

    return r;
  };

  const query = `select * from dat."TraitsList" where "rulesets"::text[] && ARRAY['${rulesets.join("','")}'];`;
  return Timed("GetTraits Querying", () => PgPool.query<dat.TraitsList>(query)).then(result =>
    Timed("GetTraits Conversion", () => result.rows.map(convert))
  );
}
