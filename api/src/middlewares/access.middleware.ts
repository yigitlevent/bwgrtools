import { FindUserBySessionId } from "../services/user.service";

import type { FastifyRequest, FastifyReply } from "fastify";


export function RequireAccess(roles?: string[]): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (request.session.sessionId) {
      const user = await FindUserBySessionId(request.session.sessionId);
      if (user && (!roles || roles.some(role => user.UserAccess.includes(role)))) return;
    }

    reply.code(401).send({ error: "not authenticated" });
  };
}

export const CheckAuth = RequireAccess();
export const CheckAdmin = RequireAccess(["Admin"]);
