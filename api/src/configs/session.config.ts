import { PgPool } from "../../../shared/db/utils/pgPool";
import { CreateLogger } from "../../../shared/utils/logger";

import type { SessionStore as FastifySessionStore, FastifySessionObject } from "@fastify/session";


const Log = CreateLogger("session-store");

export const SessionMaxAgeMs = 1000 * 60 * 60 * 24;

declare module "@fastify/session" {
  interface FastifySessionObject {
    user?: UserSession;
  }
}

interface SessionRow {
  sess: FastifySessionObject;
}

class PgSessionStore implements FastifySessionStore {
  set(sid: string, session: FastifySessionObject, callback: (err?: unknown) => void): void {
    const expire = session.cookie.expires ? new Date(session.cookie.expires) : new Date(Date.now() + SessionMaxAgeMs);

    const query = `
      INSERT INTO usr."UserSession" ("sid", "sess", "expire")
      VALUES ($1, $2, $3)
      ON CONFLICT ("sid") DO UPDATE SET "sess" = $2, "expire" = $3
    `;
    PgPool.query(query, [sid, JSON.stringify(session), expire])
      .then(() => { callback(); })
      .catch((err: unknown) => {
        Log.error(err, "session store set error");
        callback(err);
      });
  }

  get(sid: string, callback: (err?: unknown, session?: FastifySessionObject | null) => void): void {
    const query = `
      SELECT "sess"
      FROM usr."UserSession"
      WHERE "sid" = $1 AND "expire" >= NOW()
    `;
    PgPool.query<SessionRow>(query, [sid])
      .then(result => {
        callback(undefined, result.rows.length > 0 ? result.rows[0].sess : null);
      })
      .catch((err: unknown) => {
        Log.error(err, "session store get error");
        callback(err);
      });
  }

  destroy(sid: string, callback: (err?: unknown) => void): void {
    const query = `
      DELETE FROM usr."UserSession"
      WHERE "sid" = $1
    `;
    PgPool.query(query, [sid])
      .then(() => { callback(); })
      .catch((err: unknown) => {
        Log.error(err, "session store destroy error");
        callback(err);
      });
  }
}

export const SessionStore = new PgSessionStore();
