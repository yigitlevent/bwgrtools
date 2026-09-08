import Pg from "pg";

import { Env } from "../../utils/env";

import type { PoolConfig } from "pg";


export type Queryable = Pg.Pool | Pg.PoolClient;


const Max = process.env.PGPOOL_MAX ? parseInt(process.env.PGPOOL_MAX) : 10;

// Local/loopback Postgres never has TLS configured (no cert, connection never leaves the box) —
// only require a verified TLS connection in prod when the DB is actually remote.
const IsLocalDb = Env.dbHost === "localhost" || Env.dbHost === "127.0.0.1";

const Config: PoolConfig = {
  user: Env.dbUser,
  password: Env.dbPass,
  host: Env.dbHost,
  port: Env.dbPort,
  database: Env.dbName,
  max: Max,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0,
  ssl: Env.env === "prod" && !IsLocalDb ? { rejectUnauthorized: true } : false
};

function CreatePgPool(): Pg.Pool {
  return new Pg.Pool(Config);
}

export const PgPool = CreatePgPool();

PgPool.on("error", (err, client) => {
  console.error(err, "unexpected error on idle Postgres client");
  client.release(err);
});

export async function CheckDbPool(): Promise<void> {
  const client = await PgPool.connect();
  try {
    await client.query("SELECT 1");
  }
  finally {
    client.release();
  }
}

export async function WithTransaction<T>(fn: (client: Pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await PgPool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  }
  catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
  finally {
    client.release();
  }
}
