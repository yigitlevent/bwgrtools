import { Env } from "./GetEnvironment";


async function Fetch<Response>(method: "GET" | "POST", endpoint: string, body: object | null, signal?: AbortSignal): Promise<Response> {
  const url = `${Env.apiUrl}/api${endpoint}`;

  const response = await fetch(
    url,
    {
      method,
      credentials: "include",
      headers: body !== null ? { "Content-Type": "application/json" } : {},
      body: body !== null ? JSON.stringify(body) : undefined,
      signal
    }
  );

  if (response.ok) {
    return response.json() as Promise<Response>;
  }
  throw new Error(`Request to ${method}/${endpoint} failed with status ${String(response.status)}`);
}

interface EmailPasswordBody { email: string; password: string; }

export async function RequestSignUp(body: EmailPasswordBody): Promise<{ user: UserSession; }> {
  return Fetch("POST", "/user/signup", body);
}

export async function RequestSignIn(body: EmailPasswordBody): Promise<{ user: UserSession; }> {
  return Fetch("POST", "/user/signin", body);
}

export async function RequestSignOut(): Promise<null> {
  return Fetch("POST", "/user/signout", null);
}

export async function RequestAuth(): Promise<{ user: UserSession; }> {
  return Fetch("POST", "/user/auth", null);
}

export async function RequestRulesetsList(signal?: AbortSignal): Promise<RulesetsResponse> {
  return Fetch("GET", "/ruleset/list", null, signal);
}

export async function RequestRulesetsData(rulesets: dat.RulesetId[], signal?: AbortSignal): Promise<RulesetResponse> {
  return Fetch("POST", "/ruleset/data", { rulesets }, signal);
}
