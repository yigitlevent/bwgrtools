import pino from "pino";


export interface Logger {
  info: (objOrMsg: unknown, msg?: string) => void;
  warn: (objOrMsg: unknown, msg?: string) => void;
  error: (objOrMsg: unknown, msg?: string) => void;
}

const Root = pino({ level: process.env.LOG_LEVEL ?? "info" });

export function CreateLogger(name: string): Logger {
  return Root.child({ name });
}
