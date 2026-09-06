import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


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

  const log = new Logger("GetQuestions Querying");
  const query = "select * from dat.\"QuestionList\";";
  return PgPool.query<dat.QuestionList>(query)
    .then(result => {
      log.end();
      const log2 = new Logger("GetQuestions Conversion");
      const res = result.rows.map(convert);
      log2.end();
      return res;
    });
}
