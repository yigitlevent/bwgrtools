import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetSpellFacets(): Promise<SpellFacets> {
  const query = "select \"id\", \"name\", \"obstacle\", \"actions\", \"resource\"";
  const query1 = `${query} from dat."SpellOriginFacet";`;
  const query2 = `${query} from dat."SpellElementFacet";`;
  const query3 = `${query} from dat."SpellImpetusFacet";`;
  const query4 = `${query} from dat."SpellDurationFacet";`;
  const query5 = `${query} from dat."SpellAreaOfEffectFacet";`;

  const log = new Logger("GetSpellFacets Querying");
  return Promise.all([
    PgPool.query<SpellOriginFacet>(query1),
    PgPool.query<SpellElementFacet>(query2),
    PgPool.query<SpellImpetusFacet>(query3),
    PgPool.query<SpellDurationFacet>(query4),
    PgPool.query<SpellAreaOfEffectFacet>(query5)
  ]).then((result): SpellFacets => {
    log.end();
    const res = {
      origins: result[0].rows,
      elements: result[1].rows,
      impetus: result[2].rows,
      duration: result[3].rows,
      areaOfEffects: result[4].rows
    };
    return res;
  });
}
