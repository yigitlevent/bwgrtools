import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const RequiredKeys = [
  "VITE_ENV", "API_PORT", "API_INTERNAL_URL", "CLIENT_URL",
  "DB_USER", "DB_HOST", "DB_PORT", "DB_NAME"
] as const;

function ValidEnv(): Record<string, string> {
  return {
    VITE_ENV: "dev",
    API_PORT: "3000",
    API_INTERNAL_URL: "http://localhost:3000",
    CLIENT_URL: "http://localhost:5173",
    DB_USER: "user",
    DB_HOST: "localhost",
    DB_PORT: "5432",
    DB_NAME: "bwgr",
  };
}

let savedEnv: Record<string, string | undefined>;

// shared/utils/env.ts calls dotenv's config() at module scope, which fills in any process.env key
// that is entirely absent from the repo's real .env file -- but leaves an already-present key
// alone even if it's an empty string. So "missing" here must mean "set to empty string", not
// "deleted", or dotenv would silently backfill the real .env value and defeat the test.
function ApplyEnv(overrides: Record<string, string | undefined>): void {
  for (const key of RequiredKeys) {
    process.env[key] = overrides[key] ?? "";
  }
}

describe("GetBaseEnv (shared/utils/env)", () => {
  beforeEach(() => {
    savedEnv = { ...process.env };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  it("returns the parsed env when all required vars are valid", async () => {
    ApplyEnv(ValidEnv());
    process.env.DB_PASS = "";
    const { Env } = await vi.importActual<typeof import("../../../shared/utils/env")>("../../../shared/utils/env");
    expect(Env).toEqual({
      env: "dev",
      apiPort: "3000",
      apiInternalUrl: "http://localhost:3000",
      clientUrl: "http://localhost:5173",
      dbUser: "user",
      dbPass: "",
      dbHost: "localhost",
      dbPort: 5432,
      dbName: "bwgr"
    });
  });

  it("defaults dbPass to an empty string when unset", async () => {
    ApplyEnv(ValidEnv());
    process.env.DB_PASS = "";
    const { Env } = await vi.importActual<typeof import("../../../shared/utils/env")>("../../../shared/utils/env");
    expect(Env.dbPass).toBe("");
  });

  it.each([
    ["VITE_ENV", "bad environment"],
    ["API_PORT", "bad apiPort"],
    ["API_INTERNAL_URL", "bad apiInternalUrl"],
    ["CLIENT_URL", "bad clientUrl"],
    ["DB_USER", "bad dbUser"],
    ["DB_HOST", "bad dbHost"],
    ["DB_PORT", "bad dbPort"],
    ["DB_NAME", "bad dbName"]
  ] as const)("throws %s when %s is missing", async (key, message) => {
    ApplyEnv({ ...ValidEnv(), [key]: undefined });
    await expect(vi.importActual("../../../shared/utils/env")).rejects.toThrow(message);
  });

  it("rejects a VITE_ENV value that is not dev/prod", async () => {
    ApplyEnv({ ...ValidEnv(), VITE_ENV: "staging" });
    await expect(vi.importActual("../../../shared/utils/env")).rejects.toThrow("bad environment");
  });

  it("uses DB_PASS directly when it is set (not just the empty-string default)", async () => {
    ApplyEnv(ValidEnv());
    process.env.DB_PASS = "hunter2";
    const { Env } = await vi.importActual<typeof import("../../../shared/utils/env")>("../../../shared/utils/env");
    expect(Env.dbPass).toBe("hunter2");
  });
});
