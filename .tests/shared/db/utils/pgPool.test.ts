import { beforeAll, describe, expect, it, vi } from "vitest";

import type Pg from "pg";


// node.setup.ts globally mocks this module for every other test file's convenience. This file
// needs the real PgPool singleton, so it unmocks the module.
vi.unmock("../../../../shared/db/utils/pgPool");

let PgPool: Pg.Pool;

beforeAll(async () => {
  const mod = await import("../../../../shared/db/utils/pgPool");
  PgPool = mod.PgPool;
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
