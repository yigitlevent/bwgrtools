import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RequestRulesetsData, RequestRulesetsList } from "../../../client/src/utils/Fetch";


function MockFetchResponse(ok: boolean, body: unknown, status = 200): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body)
  }));
}

describe("RequestRulesetsList", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GETs the ruleset list endpoint with credentials included", async () => {
    MockFetchResponse(true, { rulesets: [] });

    await RequestRulesetsList();

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/ruleset/list",
      expect.objectContaining({ method: "GET", credentials: "include", headers: {}, body: undefined })
    );
  });

  it("returns the parsed JSON body on a successful response", async () => {
    MockFetchResponse(true, { rulesets: [{ id: 1 }] });
    const result = await RequestRulesetsList();
    expect(result).toEqual({ rulesets: [{ id: 1 }] });
  });

  it("throws with the method, endpoint, and status when the response is not ok", async () => {
    MockFetchResponse(false, {}, 500);
    await expect(RequestRulesetsList()).rejects.toThrow("Request to GET//ruleset/list failed with status 500");
  });

  it("forwards an AbortSignal to fetch", async () => {
    MockFetchResponse(true, { rulesets: [] });
    const controller = new AbortController();

    await RequestRulesetsList(controller.signal);

    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ signal: controller.signal }));
  });
});

describe("RequestRulesetsData", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POSTs the ruleset ids as a JSON body with a Content-Type header", async () => {
    MockFetchResponse(true, { ruleset: {} });

    await RequestRulesetsData([1 as unknown as dat.RulesetId, 2 as unknown as dat.RulesetId]);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/ruleset/data",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rulesets: [1, 2] })
      })
    );
  });
});
