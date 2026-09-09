import { config } from "dotenv";


config({ debug: true, path: "../.env", encoding: "utf8" });

function GetBaseEnv(): ApiEnv {
  const parseVarToInt = (value: string | undefined): number | undefined => {
    return value !== undefined ? parseInt(value, 10) : undefined;
  };

  const env = process.env.VITE_ENV as "dev" | "prod" | undefined;
  const apiPort = process.env.API_PORT;
  const apiInternalUrl = process.env.API_INTERNAL_URL;
  const clientUrl = process.env.CLIENT_URL;
  const dbUser = process.env.DB_USER;
  const dbPass = process.env.DB_PASS ?? "";
  const dbHost = process.env.DB_HOST;
  const dbPort = parseVarToInt(process.env.DB_PORT);
  const dbName = process.env.DB_NAME;

  if (!(env !== undefined && env.length > 0 && ["dev", "prod"].includes(env))) throw new Error("bad environment");
  if (!(apiPort !== undefined && apiPort.length > 0)) throw new Error("bad apiPort");
  if (!(apiInternalUrl !== undefined && apiInternalUrl.length > 0)) throw new Error("bad apiInternalUrl");
  if (!(clientUrl !== undefined && clientUrl.length > 0)) throw new Error("bad clientUrl");
  if (!(dbUser !== undefined && dbUser.length > 0)) throw new Error("bad dbUser");
  if (!(dbHost !== undefined && dbHost.length > 0)) throw new Error("bad dbHost");
  if (dbPort === undefined || Number.isNaN(dbPort)) throw new Error("bad dbPort");
  if (!(dbName !== undefined && dbName.length > 0)) throw new Error("bad dbName");

  return {
    env,
    apiPort,
    apiInternalUrl,
    clientUrl, dbUser,
    dbPass,
    dbHost,
    dbPort,
    dbName
  };
}

export const Env = GetBaseEnv();
