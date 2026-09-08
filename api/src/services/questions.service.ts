import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


export async function GetQuestions(): Promise<Question[]> {
  const convert = (v: dat.QuestionList): Question => {
    const r: Question = {
      id: v.id,
      name: v.name,
      question: v.question
    };

    if (v.attributeId1 || v.attributeId2) r.attributes = [];
    if (v.attributeId1 && v.attributeName1) r.attributes?.push([v.attributeId1, v.attributeName1]);
    if (v.attributeId2 && v.attributeName2) r.attributes?.push([v.attributeId2, v.attributeName2]);

    return r;
  };

  const query = "select * from dat.\"QuestionList\";";
  return Timed("GetQuestions Querying", () => PgPool.query<dat.QuestionList>(query))
    .then(result => Timed("GetQuestions Conversion", () => result.rows.map(convert)));
}
