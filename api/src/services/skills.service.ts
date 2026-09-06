import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetSkills(rulesets: dat.RulesetId[]): Promise<Skill[]> {
  const convert = (v: dat.SkillsList): Skill => {
    const r: Skill = {
      rulesets: v.rulesets,
      id: v.id,
      name: v.name,
      category: [v.categoryId, v.category!],
      type: [v.typeId, v.type!],
      flags: {
        dontList: v.dontList,
        isMagical: v.isMagical,
        isTraining: v.isTraining
      },
      tool: {
        typeId: v.toolTypeId,
        tool: v.tool
      }
    };

    if (v.stockId !== null && v.stock !== null) r.stock = [v.stockId, v.stock];
    if (v.rootIds && v.rootIds.length > 0) r.roots = v.rootIds.map((rootId, index) => [rootId, (v.roots ?? [])[index]]);
    if (v.toolDescription !== null) r.tool.description = v.toolDescription;
    if (v.description !== null) r.description = v.description;
    if (v.subskillIds && v.subskillIds.length > 0) r.subskillIds = v.subskillIds;
    if (v.restrictionOnlyStockId !== null && v.restrictionOnlyStock !== null) {
      r.restriction = { onlyStock: [v.restrictionOnlyStockId, v.restrictionOnlyStock] };
      if (v.restrictionWhenBurning !== null) r.restriction.onlyAtBurn = v.restrictionWhenBurning;
      if (v.restrictionAbilityId !== null && v.restrictionAbility !== null) r.restriction.onlyWithAbility = [v.restrictionAbilityId, v.restrictionAbility];
    }

    return r;
  };

  const log = new Logger("GetSkills Querying");
  const query = `select * from dat."SkillsList" where "rulesets"::text[] && ARRAY['${rulesets.join("','")}'];`;
  return PgPool.query<dat.SkillsList>(query).then(result => {
    log.end();
    const log2 = new Logger("GetSkills Conversion");
    const res = result.rows.map(convert);
    log2.end();
    return res;
  });
}
