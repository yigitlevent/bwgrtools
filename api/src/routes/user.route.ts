import { UserAuth, UserSignIn, UserSignOut, UserSignUp } from "../controllers/user.controller";
import { CheckAuth } from "../middlewares/access.middleware";
import { SignInSchema, SignUpSchema } from "../validators/user.validator";

import type { FastifyInstance } from "fastify";


export default function UserRoutes(fastify: FastifyInstance): void {
  fastify.post("/user/auth", { preHandler: [CheckAuth] }, UserAuth);

  fastify.post("/user/signup", {
    schema: { body: SignUpSchema },
    handler: UserSignUp
  });

  fastify.post("/user/signin", {
    schema: { body: SignInSchema },
    handler: UserSignIn
  });

  fastify.post("/user/signout", UserSignOut);
}
