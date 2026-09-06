import { Env } from "../../../shared/utils/env";

import type { FastifyCorsOptions } from "@fastify/cors";


export const CorsConfig: FastifyCorsOptions = {
  origin: Env.env === "prod" ? Env.clientUrl : true,
  methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS", "HEAD"],
  credentials: true,
  allowedHeaders: ["Content-Type"]
};
