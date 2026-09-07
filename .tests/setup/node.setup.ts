import { vi } from "vitest";

vi.mock("../../shared/db/utils/pgPool", () => ({
  PgPool: { query: vi.fn(), on: vi.fn() }
}));

vi.mock("../../shared/utils/env", () => ({
  Env: {
    env: "dev",
    apiPort: "3000",
    apiInternalUrl: "http://localhost:3000",
    apiSecret: "test-secret",
    clientUrl: "http://localhost:5173",
    dbUser: "test",
    dbPass: "test",
    dbHost: "localhost",
    dbPort: 5432,
    dbName: "test",
    signinLockoutThreshold: 5
  }
}));

process.env.NODE_ENV = "test";
