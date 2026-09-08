import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


export async function GetAltSpellFacets(): Promise<AltSpellFacets> {
  const query = "select \"id\", \"name\", \"obstacle\", \"actions\", \"resource\"";
  const query1 = `${query} from dat."AltSpellOriginFacet";`;
  const query2 = `${query} from dat."AltSpellPrimeElementFacet";`;
  const query3 = `${query} from dat."AltSpellLowerElementFacet";`;
  const query4 = `${query} from dat."AltSpellHigherElementFacet";`;
  const query5 = `${query} from dat."AltSpellLawFacet";`;

  const queryWithSubfacet = "select \"id\", \"name\", \"obstacle\", \"actions\", \"resource\", \"subFacet\" as \"subfacet\"";
  const query6 = `${queryWithSubfacet} from dat."AltSpellDurationFacet";`;
  const query7 = `${queryWithSubfacet} from dat."AltSpellAreaOfEffectFacet";`;

  return Timed("GetAltSpellFacets Querying", () => Promise.all([
    PgPool.query<SpellOriginFacet>(query1),
    PgPool.query<SpellElementFacet>(query2),
    PgPool.query<SpellElementFacet>(query3),
    PgPool.query<SpellElementFacet>(query4),
    PgPool.query<SpellImpetusFacet>(query5),
    PgPool.query<SpellDurationFacet>(query6),
    PgPool.query<SpellAreaOfEffectFacet>(query7)
  ])).then((result): AltSpellFacets => ({
    origins: result[0].rows,
    primeElements: result[1].rows,
    lowerElements: result[2].rows,
    higherElements: result[3].rows,
    impetus: result[4].rows,
    duration: result[5].rows,
    areaOfEffects: result[6].rows
  }));
}
