import fs from "fs";
import path from "path";

import pg from "pg";

import { Env } from "../utils/env";


const { Client } = pg;

const PgClient = new Client({ user: Env.dbUser, password: Env.dbPass, host: Env.dbHost, port: Env.dbPort, database: Env.dbName });

const ResetMarkerPath = path.join(path.dirname(new URL(import.meta.url).pathname), ".reset");

async function RunSqlFile(fileName: string): Promise<void> {
  const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "_initial");
  const filePath = path.join(dir, fileName);

  console.log(`Running initial SQL: ${fileName}`);
  const sql = fs.readFileSync(filePath, "utf8");
  await PgClient.query(sql);
  console.log(`Completed initial SQL: ${fileName}`);
}

void (async () => {
  try {
    if (Env.env === "prod" && fs.existsSync(ResetMarkerPath)) {
      throw new Error("Database already initialized. Delete the .reset file to rerun the reset process.");
    }

    console.log("\n=== Connecting to local Postgres ===");
    await PgClient.connect();

    console.log("\n=== Running Initial SQL Scripts ===");
    await RunSqlFile("0_reset.sql");

    fs.writeFileSync(ResetMarkerPath, `reset completed at ${new Date().toISOString()}\n`, "utf8");
    console.log("\n=== Database reset completed successfully ===");
    console.log(`=== Created reset marker: ${ResetMarkerPath} ===`);
  }
  catch (err) {
    console.error("Error during db:reset:", err);
    process.exit(1);
  }
  finally {
    await PgClient.end();
  }
})();
