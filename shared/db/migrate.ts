import fs from "fs";
import path from "path";

import pg from "pg";

import { Env } from "../utils/env";

import type { Client as PgClientType } from "pg";


const { Client } = pg;

const PgClient = new Client({ user: Env.dbUser, password: Env.dbPass, host: Env.dbHost, port: Env.dbPort, database: Env.dbName });

const LockId = 1234567890;

interface MigrationModule {
  default: (client: PgClientType) => Promise<void>;
  down?: (client: PgClientType) => Promise<void>;
}

interface PgRows<T> {
  rows: T[];
}

interface MigrationNameRow {
  name: string;
}

interface AdvisoryLockRow {
  pg_try_advisory_lock: boolean;
}

const MigrationsDir = path.join(path.dirname(new URL(import.meta.url).pathname), "migrations");

async function RunMigrations(): Promise<void> {
  const result: PgRows<MigrationNameRow> = await PgClient.query("SELECT name FROM meta.\"Migration\"");
  const executedMigrations = new Set(result.rows.map(row => row.name));

  const files = fs.readdirSync(MigrationsDir).filter(f => !["_initial"].includes(f)).sort();

  if (files.length === 0) {
    console.log("No migrations to run.");
    return;
  }

  for (const file of files) {
    if (executedMigrations.has(file)) {
      console.log(`Skipped migration: ${file}`);
      continue;
    }

    const filePath = path.join(MigrationsDir, file);
    console.log(`Running migration: ${file}`);

    await PgClient.query("BEGIN");

    try {
      if (file.endsWith(".sql")) {
        const contents = fs.readFileSync(filePath, "utf-8");
        const upSql = contents.split(/^-- DOWN$/m)[0];
        await PgClient.query(upSql);
      }
      else if (file.endsWith(".mjs")) {
        const { default: migrate } = (await import(`file://${filePath}`)) as MigrationModule;
        await migrate(PgClient);
      }

      await PgClient.query("INSERT INTO meta.\"Migration\" (name) VALUES ($1)", [file]);
      await PgClient.query("COMMIT");
      console.log(`Completed migration: ${file}`);
    }
    catch (error) {
      await PgClient.query("ROLLBACK");
      throw error;
    }
  }
}

async function RunRollback(name?: string): Promise<void> {
  let target = name;

  if (target === undefined) {
    const result: PgRows<MigrationNameRow> = await PgClient.query(
      "SELECT name FROM meta.\"Migration\" ORDER BY \"executedAt\" DESC LIMIT 1"
    );
    if (result.rows.length === 0) {
      console.log("No migrations to roll back.");
      return;
    }
    target = result.rows[0].name;
  }

  const check: PgRows<MigrationNameRow> = await PgClient.query(
    "SELECT name FROM meta.\"Migration\" WHERE name = $1", [target]
  );
  if (check.rows.length === 0) {
    console.log(`Migration not applied: ${target}`);
    return;
  }

  const filePath = path.join(MigrationsDir, target);
  console.log(`Rolling back migration: ${target}`);

  await PgClient.query("BEGIN");

  try {
    if (target.endsWith(".sql")) {
      const contents = fs.readFileSync(filePath, "utf-8");
      const parts = contents.split(/^-- DOWN$/m);
      if (parts.length < 2 || parts[1].trim() === "") {
        throw new Error(`No DOWN block found in ${target}. Cannot roll back automatically.`);
      }
      await PgClient.query(parts[1]);
    }
    else if (target.endsWith(".mjs")) {
      const { down } = (await import(`file://${filePath}`)) as MigrationModule;
      if (down === undefined) throw new Error(`No down export found in ${target}. Cannot roll back automatically.`);
      await down(PgClient);
    }

    await PgClient.query("DELETE FROM meta.\"Migration\" WHERE name = $1", [target]);
    await PgClient.query("COMMIT");
    console.log(`Rolled back migration: ${target}`);
  }
  catch (error) {
    await PgClient.query("ROLLBACK");
    throw error;
  }
}

const Command = process.argv[2];

void (async () => {
  try {
    await PgClient.connect();

    const lockResult: PgRows<AdvisoryLockRow> = await PgClient.query("SELECT pg_try_advisory_lock($1)", [LockId]);
    if (!lockResult.rows[0].pg_try_advisory_lock) {
      console.log("Another migration is already running, skipping.");
      process.exit(0);
    }

    if (Command === "rollback") {
      const target = process.argv[3];
      console.log("\n=== Rolling Back Migration ===");
      await RunRollback(target);
    }
    else {
      console.log("\n=== Running Migrations ===");
      await RunMigrations();

      console.log("\n=== All migrations completed successfully ===");
    }
  }
  catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
  finally {
    await PgClient.query("SELECT pg_advisory_unlock($1)", [LockId]);
    await PgClient.end();
  }
})();
