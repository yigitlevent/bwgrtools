import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";


// pgPool.ts computes Max/IsLocalDb/Config as module-level constants from process.env and Env at
// import time, and none of them are exported -- so the only way to observe their effect on the
// underlying branches (ssl on/off, default vs custom PGPOOL_MAX) is to re-import the real module
// under different mocked Env/process.env state each time and inspect the resulting real pg.Pool
// instance's own retained `options` (pg-pool's Pool constructor stores its config on `this.options`).
let savedPgPoolMax: string | undefined;

function MockEnv(overrides: Partial<ApiEnv>): void {
  vi.doMock("../../../../shared/utils/env", () => ({
    Env: {
      env: "dev",
      apiPort: "3000",
      apiInternalUrl: "http://localhost:3000",
      clientUrl: "http://localhost:5173",
      dbUser: "user",
      dbPass: "pass",
      dbHost: "localhost",
      dbPort: 5432,
      dbName: "bwgr",
      ...overrides
    }
  }));
}

describe("pgPool Config", () => {
  beforeEach(() => {
    savedPgPoolMax = process.env.PGPOOL_MAX;
    vi.resetModules();
  });

  afterEach(() => {
    if (savedPgPoolMax === undefined) delete process.env.PGPOOL_MAX;
    else process.env.PGPOOL_MAX = savedPgPoolMax;
    vi.doUnmock("../../../../shared/utils/env");
  });

  it("defaults max to 10 when PGPOOL_MAX is unset", async () => {
    delete process.env.PGPOOL_MAX;
    MockEnv({});

    const { PgPool } = await vi.importActual<typeof import("../../../../shared/db/utils/pgPool")>("../../../../shared/db/utils/pgPool");
    expect(PgPool.options.max).toBe(10);
  });

  it("uses PGPOOL_MAX when set", async () => {
    process.env.PGPOOL_MAX = "25";
    MockEnv({});

    const { PgPool } = await vi.importActual<typeof import("../../../../shared/db/utils/pgPool")>("../../../../shared/db/utils/pgPool");
    expect(PgPool.options.max).toBe(25);
  });

  it("disables ssl for a local db host even in prod", async () => {
    delete process.env.PGPOOL_MAX;
    MockEnv({ env: "prod", dbHost: "localhost" });

    const { PgPool } = await vi.importActual<typeof import("../../../../shared/db/utils/pgPool")>("../../../../shared/db/utils/pgPool");
    expect(PgPool.options.ssl).toBe(false);
  });

  it("disables ssl outside of prod even for a remote db host", async () => {
    delete process.env.PGPOOL_MAX;
    MockEnv({ env: "dev", dbHost: "db.example.com" });

    const { PgPool } = await vi.importActual<typeof import("../../../../shared/db/utils/pgPool")>("../../../../shared/db/utils/pgPool");
    expect(PgPool.options.ssl).toBe(false);
  });

  it("requires verified ssl in prod against a remote db host", async () => {
    delete process.env.PGPOOL_MAX;
    MockEnv({ env: "prod", dbHost: "db.example.com" });

    const { PgPool } = await vi.importActual<typeof import("../../../../shared/db/utils/pgPool")>("../../../../shared/db/utils/pgPool");
    expect(PgPool.options.ssl).toEqual({ rejectUnauthorized: true });
  });

  it("treats 127.0.0.1 as local, disabling ssl even in prod", async () => {
    delete process.env.PGPOOL_MAX;
    MockEnv({ env: "prod", dbHost: "127.0.0.1" });

    const { PgPool } = await vi.importActual<typeof import("../../../../shared/db/utils/pgPool")>("../../../../shared/db/utils/pgPool");
    expect(PgPool.options.ssl).toBe(false);
  });
});
