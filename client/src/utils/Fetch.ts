import { Env } from "./GetEnvironment";


async function Fetch<Response>(method: "GET" | "POST", endpoint: string, body: object | null): Promise<Response> {
  const url = `${Env.apiUrl}${endpoint}`;

  const response = await fetch(
    url,
    {
      method,
      credentials: "include",
      headers: body !== null ? { "Content-Type": "application/json" } : {},
      body: body !== null ? JSON.stringify(body) : undefined
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

export async function RequestRulesetsList(): Promise<RulesetsResponse> {
  return Fetch("GET", "/bwgr/ruleset/list", null);
}

export async function RequestRulesetsData(rulesets: dat.RulesetId[]): Promise<RulesetResponse> {
  return Fetch("POST", "/bwgr/ruleset/data", { rulesets });
}
