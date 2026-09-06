interface Env {
  env: "dev" | "prod";
}

interface ClientEnv extends Env {
  apiUrl: string;
}

interface ApiEnv extends Env {
  apiInternalUrl: string;
  clientUrl: string;
  apiPort: string;
  apiSecret: string;
  dbUser: string;
  dbPass: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  signinLockoutThreshold: number;
}
