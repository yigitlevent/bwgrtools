import type { FastifyReply, FastifyRequest } from "fastify";


interface ControllerErrorOptions {
  logMessage?: string;
  status?: number;
  error?: string;
}

export function HandleControllerError(request: FastifyRequest, reply: FastifyReply, e: unknown, options: ControllerErrorOptions = {}): void {
  const { logMessage, status = 500, error = "internal error" } = options;
  if (logMessage !== undefined) request.log.error(e, logMessage);
  else request.log.error(e);
  reply.code(status).send({ error });
}
