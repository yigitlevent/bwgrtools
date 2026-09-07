import { GetRulesetsData, GetRulesetsList } from "../controllers/ruleset.controller";

import type { FastifyInstance } from "fastify";


export default function BwgrRoutes(fastify: FastifyInstance): void {
  fastify.get("/ruleset/list", GetRulesetsList);
  fastify.post("/ruleset/data", GetRulesetsData);
}
