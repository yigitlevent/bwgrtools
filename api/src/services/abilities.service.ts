import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetAbilities(): Promise<Ability[]> {
  const convert = (v: dat.AbilitiesList): Ability => {
    const r: Ability = {
      id: v.id,
      name: v.name,
      abilityType: [v.abilityTypeId!, v.abilityType!],
      hasShades: v.hasShades
    };

    if (v.requiredTraitId !== null && v.requiredTrait) {
      r.requiredTrait = [v.requiredTraitId, v.requiredTrait];
    }

    if (v.cycle !== null && v.routine !== null && v.difficult !== null && v.challenging !== null) {
      r.practice = {
        cycle: v.cycle,
        routineTests: v.routine,
        difficultTests: v.difficult,
        challengingTests: v.challenging
      };
    }

    return r;
  };

  const log = new Logger("GetAbilities Querying");
  const query = "select * from dat.\"AbilitiesList\";";
  return PgPool.query<dat.AbilitiesList>(query).then(result => {
    log.end();
    const log2 = new Logger("GetAbilities Conversion");
    const res = result.rows.map(convert);
    log2.end();
    return res;
  });
}
