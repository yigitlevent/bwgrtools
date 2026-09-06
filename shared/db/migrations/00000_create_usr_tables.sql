CREATE TABLE IF NOT EXISTS
  usr."UserAccessType" (
    "id" SERIAL NOT NULL,
    "name" CHARACTER VARYING(127) NOT NULL COLLATE pg_catalog."default",
    PRIMARY KEY ("id")
  );

CREATE TABLE IF NOT EXISTS
  usr."User" (
    "id" UUID NOT NULL DEFAULT uuidv7 (),
    "email" CHARACTER VARYING(255) NOT NULL COLLATE pg_catalog."default",
    "password" CHARACTER VARYING(255) NOT NULL COLLATE pg_catalog."default",
    "active" BOOLEAN NOT NULL DEFAULT FALSE,
    "failedSignInAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deletedAt" TIMESTAMPTZ,
    "lastSigninAt" TIMESTAMPTZ,
    PRIMARY KEY ("id"),
    UNIQUE ("email")
  );

CREATE TABLE IF NOT EXISTS
  usr."UserAccess" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "userAccessTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deletedAt" TIMESTAMPTZ,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("userId") REFERENCES usr."User" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE CASCADE NOT VALID,
    FOREIGN KEY ("userAccessTypeId") REFERENCES usr."UserAccessType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE IF NOT EXISTS
  usr."UserSession" (
    "sid" CHARACTER VARYING NOT NULL COLLATE pg_catalog."default",
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY ("sid")
  );

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON usr."UserSession" USING btree ("expire" ASC NULLS LAST) TABLESPACE pg_default;

CREATE UNIQUE INDEX IF NOT EXISTS "UX_user_unexpired_session" ON usr."UserSession" ((sess -> 'user' ->> 'id'));

CREATE TABLE IF NOT EXISTS
  usr."RateLimit" (
    "key" CHARACTER VARYING(512) NOT NULL COLLATE pg_catalog."default",
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    PRIMARY KEY ("key")
  );

CREATE INDEX IF NOT EXISTS "IDX_rate_limit_expires" ON usr."RateLimit" USING btree ("expiresAt" ASC NULLS LAST);

INSERT INTO
  usr."UserAccessType" ("id", "name")
VALUES
  (0, 'Admin'),
  (1, 'Player');