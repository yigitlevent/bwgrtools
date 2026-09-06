import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetPractices(): Promise<Practice[]> {
  const convert = (v: dat.PracticeList): Practice => {
    if (v.ability !== null && v.abilityId !== null) {
      return {
        id: v.id,
        ability: [v.abilityId, v.ability],
        cycle: v.cycle,
        routine: v.routine,
        difficult: v.difficult,
        challenging: v.challenging
      };
    }
    else if (v.skillType !== null && v.skillTypeId !== null) {
      return {
        id: v.id,
        skillType: [v.skillTypeId, v.skillType],
        cycle: v.cycle,
        routine: v.routine,
        difficult: v.difficult,
        challenging: v.challenging
      };
    }
    else throw new Error("shall not happen");
  };

  const log = new Logger("GetPractices Querying");
  const query = "select * from dat.\"PracticeList\";";
  return PgPool.query<dat.PracticeList>(query)
    .then(result => {
      log.end();
      const log2 = new Logger("GetPractices Conversion");
      const res = result.rows.map(convert);
      log2.end();
      return res;
    });
}
