import bcrypt from "bcrypt";

import { PgPool } from "../../../shared/db/utils/pgPool";
import { FindUserByEmail, UpdateUserLastSignInAt } from "../services/user.service";
import { HandleControllerError } from "../utils/controllerError";

import type { FastifyRequest, FastifyReply } from "fastify";


export function UserAuth(request: FastifyRequest, reply: FastifyReply): void {
  reply.send({ user: request.session.user });
}

interface SignUpBody { email: string; password: string; }
interface SignInBody { email: string; password: string; }

export async function UserSignUp(request: FastifyRequest<{ Body: SignUpBody; }>, reply: FastifyReply): Promise<void> {
  const { email, password } = request.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await PgPool.query<usr.User>("insert into usr.\"User\"(\"email\", \"password\") values ($1, $2) returning *;", [email, hashedPassword]);
    if (data.rows.length === 0) throw new Error("unable to sign user up");

    const user = data.rows[0];

    const userSession: UserSession = { id: user.id, email: user.email, userAccess: [] };
    request.session.user = userSession;
    await request.session.save();

    reply.code(200).send({ user: userSession });
  }
  catch (e) {
    HandleControllerError(request, reply, e, { status: 403, error: "signup failed" });
  }
}

export async function UserSignIn(request: FastifyRequest<{ Body: SignInBody; }>, reply: FastifyReply): Promise<void> {
  const { email, password } = request.body;

  try {
    const user = await FindUserByEmail(email);
    if (!user) throw new Error("email not found");

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) throw new Error("invalid password");

    await UpdateUserLastSignInAt(user.id);

    const userSession: UserSession = { id: user.id, email: user.email, userAccess: user.UserAccess };
    request.session.user = userSession;
    await request.session.save();

    reply.code(200).send({ user: userSession });
  }
  catch (e) {
    HandleControllerError(request, reply, e, { status: 403, error: "signin failed" });
  }
}

export async function UserSignOut(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.session.destroy();
    reply.code(200).send();
  }
  catch (e) {
    HandleControllerError(request, reply, e, { status: 500 });
  }
}
