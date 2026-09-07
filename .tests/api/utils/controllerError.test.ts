import { describe, expect, it, vi } from "vitest";

import { HandleControllerError } from "../../../api/src/utils/controllerError";

import type { FastifyReply, FastifyRequest } from "fastify";


function CreateMockReply(): FastifyReply {
  const reply = {
    code: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis()
  };
  return reply as unknown as FastifyReply;
}

function CreateMockRequest(): FastifyRequest {
  const request = {
    log: { error: vi.fn() }
  };
  return request as unknown as FastifyRequest;
}

describe("HandleControllerError", () => {
  it("defaults to a 500 with a generic error message", () => {
    const request = CreateMockRequest();
    const reply = CreateMockReply();

    HandleControllerError(request, reply, new Error("boom"));

    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ error: "internal error" });
    expect(request.log.error).toHaveBeenCalledWith(expect.any(Error));
  });

  it("uses the provided status and error message", () => {
    const request = CreateMockRequest();
    const reply = CreateMockReply();

    HandleControllerError(request, reply, new Error("boom"), { status: 404, error: "not found" });

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ error: "not found" });
  });

  it("logs with the custom message when provided", () => {
    const request = CreateMockRequest();
    const reply = CreateMockReply();
    const err = new Error("boom");

    HandleControllerError(request, reply, err, { logMessage: "failed to do thing" });

    expect(request.log.error).toHaveBeenCalledWith(err, "failed to do thing");
  });
});
