import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import "dotenv/config";
import Fastify from "fastify";

import { CorsConfig } from "./configs/cors.config";
import BwgrRoutes from "./routes/bwgr.route";
import { Env } from "../../shared/utils/env";

import type { FastifyError } from "fastify";


const App = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info"
  }
});

App.register(fastifyHelmet);
App.register(fastifyCors, CorsConfig);
App.register(fastifyRateLimit, { max: 10, timeWindow: "1 minute" });

App.register(BwgrRoutes, { prefix: "/api" });

App.setErrorHandler((err: FastifyError, _request, reply) => {
  if (reply.sent) return;

  if (err.validation !== undefined) {
    reply.code(err.statusCode ?? 400).send({ error: err.message });
    return;
  }

  App.log.error(err);
  reply.code(500).send({ error: "internal error" });
});

App.listen({ port: parseInt(Env.apiPort, 10), host: "0.0.0.0" }, err => {
  if (err !== null) {
    App.log.error(err);
    process.exit(1);
  }
  App.log.info(`App started on port ${Env.apiPort}`);
});

function Shutdown(signal: string): void {
  App.log.info(`${signal} received, shutting down`);

  const forceExit = setTimeout(() => {
    App.log.error("Shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  App.close().then(() => process.exit(0), () => process.exit(1));
}

process.once("SIGINT", () => { Shutdown("SIGINT"); });
process.once("SIGTERM", () => { Shutdown("SIGTERM"); });
