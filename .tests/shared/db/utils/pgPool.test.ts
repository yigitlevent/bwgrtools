import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type Pg from "pg";


function CreateMockClient(): { query: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn>; } {
  return { query: vi.fn().mockResolvedValue(undefined), release: vi.fn() };
}

// node.setup.ts globally mocks this module for every other test file's convenience. This file
// needs the real WithTransaction/CheckDbPool implementations, so it unmocks the module and spies
// directly on the real PgPool singleton's connect() method -- simpler and more reliable than
// trying to mock the underlying "pg" driver, since this is a per-package node_modules workspace
// where "pg" only resolves from shared/node_modules, not from this test file's own location.
vi.unmock("../../../../shared/db/utils/pgPool");

let CheckDbPool: typeof import("../../../../shared/db/utils/pgPool").CheckDbPool;
let WithTransaction: typeof import("../../../../shared/db/utils/pgPool").WithTransaction;
let PgPool: Pg.Pool;

beforeAll(async () => {
  const mod = await import("../../../../shared/db/utils/pgPool");
  CheckDbPool = mod.CheckDbPool;
  WithTransaction = mod.WithTransaction;
  PgPool = mod.PgPool;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WithTransaction", () => {
  it("commits and releases the client when fn resolves", async () => {
    const mockClient = CreateMockClient();
    vi.spyOn(PgPool, "connect").mockResolvedValue(mockClient as never);

    const result = await WithTransaction(async () => "done");

    expect(result).toBe("done");
    expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockClient.query).toHaveBeenNthCalledWith(2, "COMMIT");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("rolls back and releases the client when fn rejects, then rethrows", async () => {
    const mockClient = CreateMockClient();
    vi.spyOn(PgPool, "connect").mockResolvedValue(mockClient as never);
    const error = new Error("boom");

    await expect(WithTransaction(async () => { throw error; })).rejects.toThrow("boom");

    expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockClient.query).toHaveBeenNthCalledWith(2, "ROLLBACK");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});

describe("PgPool error handler", () => {
  it("logs the error and releases the offending client", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const mockClient = { release: vi.fn() };
    const error = new Error("idle client error");

    const [handler] = PgPool.listeners("error") as ((err: Error, client: { release: (err: Error) => void; }) => void)[];
    handler(error, mockClient);

    expect(consoleErrorSpy).toHaveBeenCalledWith(error, "unexpected error on idle Postgres client");
    expect(mockClient.release).toHaveBeenCalledWith(error);
  });
});

describe("CheckDbPool", () => {
  it("queries SELECT 1 and always releases the client", async () => {
    const mockClient = CreateMockClient();
    vi.spyOn(PgPool, "connect").mockResolvedValue(mockClient as never);

    await CheckDbPool();

    expect(mockClient.query).toHaveBeenCalledWith("SELECT 1");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("releases the client even when the query throws", async () => {
    const mockClient = CreateMockClient();
    mockClient.query.mockRejectedValue(new Error("db down"));
    vi.spyOn(PgPool, "connect").mockResolvedValue(mockClient as never);

    await expect(CheckDbPool()).rejects.toThrow("db down");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});
