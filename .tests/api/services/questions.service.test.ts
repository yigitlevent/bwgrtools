import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetQuestions } from "../../../api/src/services/questions.service";
import { PgPool } from "../../../shared/db/utils/pgPool";


function BaseRow(overrides: Partial<dat.QuestionList> = {}): dat.QuestionList {
  return {
    id: 1 as unknown as dat.QuestionId,
    name: "TRUST",
    question: "Do you trust easily?",
    attributeId1: null,
    attributeName1: null,
    attributeId2: null,
    attributeName2: null,
    ...overrides
  } as unknown as dat.QuestionList;
}

function MockQueryResult(rows: dat.QuestionList[]): void {
  vi.mocked(PgPool.query).mockResolvedValueOnce({ rows } as never);
}

describe("GetQuestions", () => {
  beforeEach(() => {
    vi.mocked(PgPool.query).mockReset();
  });

  it("omits attributes when neither attributeId is set", async () => {
    MockQueryResult([BaseRow()]);
    const result = await GetQuestions();
    expect(result[0].attributes).toBeUndefined();
  });

  it("includes only the first attribute when only attributeId1 is set", async () => {
    MockQueryResult([BaseRow({ attributeId1: 1 as unknown as dat.AbilityId, attributeName1: "Will" })]);
    const result = await GetQuestions();
    expect(result[0].attributes).toEqual([[1, "Will"]]);
  });

  it("includes both attributes when both are set", async () => {
    MockQueryResult([BaseRow({
      attributeId1: 1 as unknown as dat.AbilityId, attributeName1: "Will",
      attributeId2: 2 as unknown as dat.AbilityId, attributeName2: "Perception"
    })]);
    const result = await GetQuestions();
    expect(result[0].attributes).toEqual([[1, "Will"], [2, "Perception"]]);
  });

  it("initializes an empty attributes array when attributeId1 is set but attributeName1 is missing", async () => {
    MockQueryResult([BaseRow({ attributeId1: 1 as unknown as dat.AbilityId, attributeName1: null })]);
    const result = await GetQuestions();
    expect(result[0].attributes).toEqual([]);
  });
});
