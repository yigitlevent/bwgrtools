import { config } from "dotenv";


config({ debug: true, path: "../.env", encoding: "utf8" });

function GetBaseEnv(): ApiEnv {
  const parseVarToInt = (value: string | undefined): number | undefined => {
    return value !== undefined ? parseInt(value, 10) : undefined;
  };

  const env = process.env.VITE_ENV as "dev" | "prod" | undefined;
  const apiPort = process.env.API_PORT;
  const apiInternalUrl = process.env.API_INTERNAL_URL;
  const apiSecret = process.env.API_SECRET;
  const clientUrl = process.env.CLIENT_URL;
  const dbUser = process.env.DB_USER;
  const dbPass = process.env.DB_PASS ?? "";
  const dbHost = process.env.DB_HOST;
  const dbPort = parseVarToInt(process.env.DB_PORT);
  const dbName = process.env.DB_NAME;
  const signinLockoutThreshold = parseVarToInt(process.env.SIGNIN_LOCKOUT_THRESHOLD);

  if (!(env && env.length > 0 && ["dev", "prod"].includes(env))) throw new Error("bad environment");
  if (!(apiPort && apiPort.length > 0)) throw new Error("bad apiPort");
  if (!(apiInternalUrl && apiInternalUrl.length > 0)) throw new Error("bad apiInternalUrl");
  if (!(apiSecret && apiSecret.length > 0)) throw new Error("bad apiSecret");
  if (!(clientUrl && clientUrl.length > 0)) throw new Error("bad clientUrl");
  if (!(dbUser && dbUser.length > 0)) throw new Error("bad dbUser");
  if (!(dbHost && dbHost.length > 0)) throw new Error("bad dbHost");
  if (!(dbPort)) throw new Error("bad dbPort");
  if (!(dbName && dbName.length > 0)) throw new Error("bad dbName");
  if (!signinLockoutThreshold) throw new Error("bad signinLockoutThreshold");

  return {
    env,
    apiPort,
    apiInternalUrl,
    apiSecret,
    clientUrl, dbUser,
    dbPass,
    dbHost,
    dbPort,
    dbName,
    signinLockoutThreshold
  };
}

export const Env = GetBaseEnv();
