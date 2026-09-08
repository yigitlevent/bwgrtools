import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


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

  const query = "select * from dat.\"PracticeList\";";
  return Timed("GetPractices Querying", () => PgPool.query<dat.PracticeList>(query))
    .then(result => Timed("GetPractices Conversion", () => result.rows.map(convert)));
}
