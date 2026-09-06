export function GetEnvironment(): ClientEnv {
  const env = import.meta.env.VITE_ENV as "dev" | "prod" | undefined;

  if (!(env && env.length > 0 && ["dev", "prod"].includes(env))) throw new Error("bad environment");

  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (!(apiUrl && apiUrl.length > 0)) throw new Error("bad apiUrl");

  return { env, apiUrl };
}

export const Env = GetEnvironment();
