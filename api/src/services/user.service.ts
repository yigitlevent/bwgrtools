import { PgPool } from "../../../shared/db/utils/pgPool";


export async function FindUserBySessionId(sessionId: string): Promise<usr.User & { UserAccess: string[]; } | undefined> {
  const query = `
    select
      u.*,
      array(
        select uat."name"
        from usr."UserAccessType" uat
        where uat."id" = (
          select ua."userAccessTypeId"
          from usr."UserAccess" ua
          where ua."userId" = u."id"
        )
      ) as "UserAccess"
    from usr."User" u
    where u."id" = (
      select (us."sess"->'user'->>'id')::uuid as "userId"
      from usr."UserSession" us
      where us."sid" = $1
      and us."expire" > now()
      limit 1
    );
  `;

  const data = await PgPool.query<usr.User & { UserAccess: string[]; }>(query, [sessionId]);

  if (data.rows.length > 0) return data.rows[0];
}

export async function FindUserByEmail(email: string): Promise<usr.User & { UserAccess: string[]; } | undefined> {
  const query = `
    select
      u.*,
      array(
        select uat."name"
        from usr."UserAccessType" uat
        where uat."id" = (
          select ua."userAccessTypeId"
          from usr."UserAccess" ua
          where ua."userId" = u."id"
        )
      ) as "UserAccess"
    from usr."User" u
    where u."email" = $1;
  `;

  const data = await PgPool.query<usr.User & { UserAccess: string[]; }>(query, [email]);

  if (data.rows.length > 0) return data.rows[0];
}

export async function UpdateUserLastSignInAt(userId: usr.UserId): Promise<void> {
  await PgPool.query("update usr.\"User\" set \"lastSigninAt\" = now() where \"id\" = $1;", [userId]);
}
