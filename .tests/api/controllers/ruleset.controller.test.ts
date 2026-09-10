import { beforeEach, describe, expect, it, vi } from "vitest";

import { GetRulesetsData, GetRulesetsList } from "../../../api/src/controllers/ruleset.controller";
import { GetAbilities } from "../../../api/src/services/abilities.service";
import { GetDoWActions } from "../../../api/src/services/dowActions.service";
import { GetFightActions } from "../../../api/src/services/fightActions.service";
import { GetLifepaths } from "../../../api/src/services/lifepaths.service";
import { GetPractices } from "../../../api/src/services/practices.service";
import { GetQuestions } from "../../../api/src/services/questions.service";
import { GetRaCActions } from "../../../api/src/services/racActions.service";
import { GetResources } from "../../../api/src/services/resources.service";
import { GetRulesets } from "../../../api/src/services/rulesets.service";
import { GetSettings } from "../../../api/src/services/settings.service";
import { GetSkills } from "../../../api/src/services/skills.service";
import { GetAltSpellFacets } from "../../../api/src/services/spellFacets.alt.service";
import { GetSpellFacets } from "../../../api/src/services/spellFacets.service";
import { GetStocks } from "../../../api/src/services/stocks.service";
import { GetTraits } from "../../../api/src/services/traits.service";

import type { FastifyReply, FastifyRequest } from "fastify";


vi.mock("../../../api/src/services/abilities.service", () => ({ GetAbilities: vi.fn() }));
vi.mock("../../../api/src/services/stocks.service", () => ({ GetStocks: vi.fn() }));
vi.mock("../../../api/src/services/settings.service", () => ({ GetSettings: vi.fn() }));
vi.mock("../../../api/src/services/skills.service", () => ({ GetSkills: vi.fn() }));
vi.mock("../../../api/src/services/traits.service", () => ({ GetTraits: vi.fn() }));
vi.mock("../../../api/src/services/lifepaths.service", () => ({ GetLifepaths: vi.fn() }));
vi.mock("../../../api/src/services/resources.service", () => ({ GetResources: vi.fn() }));
vi.mock("../../../api/src/services/spellFacets.service", () => ({ GetSpellFacets: vi.fn() }));
vi.mock("../../../api/src/services/spellFacets.alt.service", () => ({ GetAltSpellFacets: vi.fn() }));
vi.mock("../../../api/src/services/dowActions.service", () => ({ GetDoWActions: vi.fn() }));
vi.mock("../../../api/src/services/racActions.service", () => ({ GetRaCActions: vi.fn() }));
vi.mock("../../../api/src/services/fightActions.service", () => ({ GetFightActions: vi.fn() }));
vi.mock("../../../api/src/services/practices.service", () => ({ GetPractices: vi.fn() }));
vi.mock("../../../api/src/services/questions.service", () => ({ GetQuestions: vi.fn() }));
vi.mock("../../../api/src/services/rulesets.service", () => ({ GetRulesets: vi.fn() }));

function CreateMockReply(): FastifyReply {
  return { code: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() } as unknown as FastifyReply;
}

function CreateMockRequest(body: unknown = {}): FastifyRequest {
  return { body, log: { error: vi.fn() } } as unknown as FastifyRequest;
}

describe("GetRulesetsData", () => {
  beforeEach(() => {
    vi.mocked(GetAbilities).mockResolvedValue([]);
    vi.mocked(GetStocks).mockResolvedValue([]);
    vi.mocked(GetSettings).mockResolvedValue([]);
    vi.mocked(GetSkills).mockResolvedValue([]);
    vi.mocked(GetTraits).mockResolvedValue([]);
    vi.mocked(GetLifepaths).mockResolvedValue([]);
    vi.mocked(GetResources).mockResolvedValue([]);
    vi.mocked(GetSpellFacets).mockResolvedValue({ origins: [], elements: [], impetus: [], duration: [], areaOfEffects: [] });
    vi.mocked(GetAltSpellFacets).mockResolvedValue({ origins: [], primeElements: [], lowerElements: [], higherElements: [], impetus: [], duration: [], areaOfEffects: [] });
    vi.mocked(GetDoWActions).mockResolvedValue([]);
    vi.mocked(GetRaCActions).mockResolvedValue([]);
    vi.mocked(GetFightActions).mockResolvedValue([]);
    vi.mocked(GetPractices).mockResolvedValue([]);
    vi.mocked(GetQuestions).mockResolvedValue([]);
  });

  it("assembles all service results into a single response and returns 200", async () => {
    vi.mocked(GetAbilities).mockResolvedValue([{ id: 1, name: "Will" } as never]);
    const request = CreateMockRequest({ rulesets: [1] });
    const reply = CreateMockReply();

    await GetRulesetsData(request as never, reply);

    expect(GetStocks).toHaveBeenCalledWith([1]);
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      ruleset: expect.objectContaining({ abilities: [{ id: 1, name: "Will" }] })
    });
  });

  it("returns 403 when any service call rejects", async () => {
    vi.mocked(GetTraits).mockRejectedValue(new Error("db error"));
    const request = CreateMockRequest({ rulesets: [1] });
    const reply = CreateMockReply();

    await GetRulesetsData(request as never, reply);

    expect(reply.code).toHaveBeenCalledWith(403);
  });
});

describe("GetRulesetsList", () => {
  it("returns the rulesets list wrapped in a response object with 200", async () => {
    vi.mocked(GetRulesets).mockResolvedValue([{ id: 1, name: "Core" } as never]);
    const request = CreateMockRequest();
    const reply = CreateMockReply();

    await GetRulesetsList(request, reply);

    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ version: expect.any(String), rulesets: [{ id: 1, name: "Core" }] });
  });

  it("returns 403 when GetRulesets rejects", async () => {
    vi.mocked(GetRulesets).mockRejectedValue(new Error("db error"));
    const request = CreateMockRequest();
    const reply = CreateMockReply();

    await GetRulesetsList(request, reply);

    expect(reply.code).toHaveBeenCalledWith(403);
  });
});
