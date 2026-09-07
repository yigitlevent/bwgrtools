# Deployment Guide

**Prerequisite:** The base server setup (Nginx, UFW, certbot/SSL) must already be completed per `setup-yigitlevent.md`.

## Architecture Overview

| Component | Technology | Managed By | Accessible Via |
| --------- | ---------- | ---------- | -------------- |
| API | Node.js 22 (Fastify) | PM2 (`bwgrtools-api`) | Nginx reverse proxy → `:3001` |
| Client | React SPA (Vite static build) | Nginx | Nginx static files |
| Database | PostgreSQL 18 | systemd | localhost only |
| pgAdmin | Docker (dpage/pgadmin4) | Docker | Nginx reverse proxy → `:5050` |

The project is served under the `/bwgrtools` subpath on the existing `yigitlevent.com` Nginx server.

```text
Browser → Nginx (yigitlevent.com :443)
  ├── /bwgrtools/api/*  →  reverse proxy   →  PM2 bwgrtools-api (:3001)
  ├── /bwgrtools/*      →  static files     →  TARGETDIR/bwgrtools/client/
  └── /pgadmin/*         →  reverse proxy   →  Docker pgadmin (:5050)
```

---

## 0. Initial Setup Script

`.scripts/initial_deployment.sh` automates every step in sections 1–4 below. Run it once on a server where `setup-yigitlevent.md` has already been completed; the manual sections are kept as reference.

### Before running

Generate the deploy SSH key pair **on your local machine**:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/bwgrtools_deploy -N ""
cat ~/.ssh/bwgrtools_deploy.pub   # you will paste this when the script prompts
```

### Running the script

```bash
# Copy to server (run locally)
scp .scripts/initial_deployment.sh root@YOUR_SERVER_IP:/root/

# SSH in and run as root
ssh root@YOUR_SERVER_IP
chmod +x /root/initial_deployment.sh
/root/initial_deployment.sh
```

The script prompts for these before doing anything:

| Prompt | Example |
| ------ | ------- |
| Domain name | `yigitlevent.com` (no `www` prefix) |
| PostgreSQL password for `bwgrtools` (asked twice) | strong random password |
| pgAdmin login password | password for the pgAdmin web UI |
| pgAdmin login email | must be a real, non-reserved domain — pgAdmin rejects `.local`/`.test`/`.invalid` at startup and crash-loops instead of starting; doesn't need a working mailbox |
| Deploy user's SSH public key | paste the `ssh-ed25519 AAAA...` line from above |

When the script finishes it prints the remaining manual steps (GitHub secrets, workflow trigger, first `pm2 start`). The generated `API_SECRET` is also printed — save it if you need it elsewhere, as it is already written to `/opt/bwgrtools/.env`.

---

## 1. Server Setup (project-specific)

Run all the following as `root`.

### 1.1 System Packages

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential
```

### 1.2 Node.js 22 (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node --version  # must be v22.x
```

### 1.3 PostgreSQL 18

Ubuntu's default repos don't carry a versioned `postgresql-18` package (they ship whatever version matches the OS release) — add the PGDG APT repository first:

```bash
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo "$VERSION_CODENAME")-pgdg main" \
  | tee /etc/apt/sources.list.d/pgdg.list
apt update
```

```bash
apt install -y postgresql-18 postgresql-client-18
systemctl enable --now postgresql

# Create the application database and user
sudo -u postgres psql <<'SQL'
CREATE USER bwgrtools WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE bwgrtools OWNER bwgrtools;
GRANT ALL PRIVILEGES ON DATABASE bwgrtools TO bwgrtools;
SQL
```

### 1.4 Docker & pgAdmin

```bash
# Install Docker (if not already present)
apt install -y docker.io
systemctl enable --now docker

# Run pgAdmin as a container
docker run -d \
  --name pgadmin \
  --restart always \
  -e PGADMIN_DEFAULT_EMAIL=CHANGE_ME_PGADMIN_EMAIL \
  -e PGADMIN_DEFAULT_PASSWORD=CHANGE_ME_PGADMIN_PASSWORD \
  -e SCRIPT_NAME=/pgadmin \
  -p 127.0.0.1:5050:80 \
  dpage/pgadmin4
```

`SCRIPT_NAME=/pgadmin` tells pgAdmin it's served behind a subpath. The container is bound to `127.0.0.1:5050` so it's only accessible through Nginx.

`PGADMIN_DEFAULT_EMAIL` must use a real, non-reserved domain — pgAdmin validates the email format at startup and rejects special-use TLDs like `.local`/`.test`/`.invalid` (RFC 2606/6762), crash-looping the container instead of starting. The address doesn't need a working mailbox behind it, just a real domain.

After first login, add a server connection in pgAdmin:

- **Host**: `host.docker.internal` (or the host's `docker0` IP, typically `172.17.0.1`)
- **Port**: `5432`
- **Database**: `bwgrtools`
- **Username**: `bwgrtools`

For pgAdmin to connect to the host PostgreSQL, the `pg_hba.conf` must allow connections from the Docker network. Add this line to `/etc/postgresql/18/main/pg_hba.conf`:

```text
host    bwgrtools    bwgrtools    172.17.0.0/16    scram-sha-256
```

Then add `listen_addresses = 'localhost,172.17.0.1'` to `/etc/postgresql/18/main/postgresql.conf` (or confirm it already includes the Docker bridge IP), and restart PostgreSQL:

```bash
systemctl restart postgresql
```

If UFW is active, it default-denies traffic that isn't explicitly allowed — `pg_hba.conf` and `listen_addresses` alone aren't enough, since the firewall sits in front of both. Allow the Docker bridge subnet through to port 5432:

```bash
ufw allow from 172.17.0.0/16 to any port 5432
```

### 1.5 PM2

```bash
npm install -g pm2

# Register PM2 to start on boot (run as root, use the deploy user home dir)
pm2 startup systemd -u deploy --hp /home/deploy
# ↑ This prints a command. Copy and run that command.
```

---

## 2. Deploy User & Directory Structure

```bash
# Create a non-root deploy user
adduser --disabled-password --gecos "" deploy

# Create app directory (API, shared code, migrations)
mkdir -p /opt/bwgrtools/{api,shared}
chown -R deploy:deploy /opt/bwgrtools

# Create the nginx-served client directory
mkdir -p TARGETDIR/bwgrtools/client
chown -R deploy:deploy TARGETDIR/bwgrtools

# Create log directory
mkdir -p /var/log/bwgrtools
chown deploy:deploy /var/log/bwgrtools
```

### 2.1 Deploy SSH Key

Add the deploy key pair's **public** half (generated earlier — see [Section 0](#0-initial-setup-script)) to `deploy`'s `authorized_keys`:

```bash
mkdir -p /home/deploy/.ssh
echo "ssh-ed25519 AAAA... github-actions-deploy" >> /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

### 2.2 sshd_config for the Deploy User

Two `sshd_config` settings can silently block CI's SSH access even when the key itself is correct:

- **`AllowUsers`** — if this directive is present at all, only the listed users may log in over SSH; `deploy` must be added to it or the connection is rejected before key auth is even attempted (`... not allowed because not listed in AllowUsers` in `journalctl -u ssh`).
- **`MaxAuthTries`** — if set low (e.g. `2`), an SSH client/agent offering more than one identity (common with CI SSH agents) can exhaust its attempts before offering the correct key, closing the connection with `Too many authentication failures` even though the right key was loaded.

Check and fix both:

```bash
grep -E '^AllowUsers' /etc/ssh/sshd_config
# If present and 'deploy' isn't listed:
sed -i '/^AllowUsers/ s/$/ deploy/' /etc/ssh/sshd_config

grep -E '^MaxAuthTries' /etc/ssh/sshd_config
# If present and less than 6 (OpenSSH's own default):
sed -i 's/^MaxAuthTries .*/MaxAuthTries 6/' /etc/ssh/sshd_config

sshd -t && systemctl restart ssh
```

---

## 3. Configuration Files

### 3.1 Environment Variables

Create `/opt/bwgrtools/.env` — **owner `deploy`, mode `600`**:

```bash
touch /opt/bwgrtools/.env
chown deploy:deploy /opt/bwgrtools/.env
chmod 600 /opt/bwgrtools/.env
```

Populate it (replace all `CHANGE_ME_*` values):

```env
# Environment — must be "prod" for secure sessions and SSL DB connections
VITE_ENV=prod

# API
API_PORT=3001
API_INTERNAL_URL=http://127.0.0.1:3001
API_SECRET=CHANGE_ME_LONG_RANDOM_SECRET_MIN_32_CHARS
CLIENT_URL=https://yigitlevent.com/bwgrtools
SIGNIN_LOCKOUT_THRESHOLD=5

# Database
DB_USER=bwgrtools
DB_PASS=CHANGE_ME_STRONG_PASSWORD
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bwgrtools
PGPOOL_MAX=10
```

`SIGNIN_LOCKOUT_THRESHOLD` is required and validated at boot (`shared/utils/env.ts`) — the API will refuse to start without it. `PGPOOL_MAX` is read directly via `process.env` with a default (`10`) rather than validated by `Env`, so it's optional but shown above for completeness.

Generate a strong `API_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3.2 PM2 Ecosystem Config

Create `/opt/bwgrtools/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: 'bwgrtools-api',
      script: 'dist/api/src/index.js',
      cwd: '/opt/bwgrtools/api',
      node_args: '--env-file /opt/bwgrtools/.env',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/bwgrtools/api-error.log',
      out_file: '/var/log/bwgrtools/api-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
```

```bash
chown deploy:deploy /opt/bwgrtools/ecosystem.config.cjs
```

### 3.3 Migration Runner Infrastructure

The migration runner (`shared/db/migrate.ts`) is invoked automatically on every deploy via `tsx` (matching how `shared/package.json`'s `db:migrate` script runs it locally and in CI — Node's native `--experimental-transform-types` loader does not resolve the repo's extensionless TS imports). It requires the `pg`, `tsx`, and `dotenv` packages to be present at `/opt/bwgrtools/` (`shared/utils/env.ts`, imported by `migrate.ts`, loads config via `dotenv`). Install them once during server setup — the deploy pipeline handles all future migration execution:

```bash
su - deploy
cd /opt/bwgrtools
npm init -y
npm install pg tsx dotenv
```

---

## 4. Nginx Configuration

The existing Nginx site config (`/etc/nginx/sites-available/yigitlevent.com`) is extended with bwgrtools location blocks — no separate virtual host or SSL config needed.

### 4.1 Client Build Changes

The Vite build and React Router are already configured for the `/bwgrtools` subpath — no changes needed at deploy time, but the mechanism is worth understanding.

**`client/vite.config.ts`** — `base` is conditional on build mode, so only production builds get the subpath prefix; dev keeps `/` for local iteration:

```ts
export default defineConfig(({ mode }) => {
  // ...
  return {
    base: mode === "production" ? "/bwgrtools/" : "/",
    // ...rest
  };
});
```

**React Router** — `basename` is derived from Vite's resolved `base` at runtime rather than hardcoded:

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

### 4.2 Nginx Location Blocks

Add the following inside the existing `server` block for port 443 in `/etc/nginx/sites-available/yigitlevent.com`:

```nginx
# bwgrtools — API reverse proxy
location /bwgrtools/api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# bwgrtools — redirect bare path to the trailing-slash form
# (a prefix location with a trailing slash only matches URLs that also
# have one, so /bwgrtools with no slash would otherwise fall through
# to the root site's `location /` block instead)
location = /bwgrtools {
    return 301 /bwgrtools/;
}

# bwgrtools — static client SPA
location /bwgrtools/ {
    alias TARGETDIR/bwgrtools/client/;
    index index.html;
    try_files $uri $uri/ /bwgrtools/index.html;
}

# pgAdmin — reverse proxy to Docker container
location /pgadmin/ {
    proxy_pass http://127.0.0.1:5050/pgadmin/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Script-Name /pgadmin;
    proxy_redirect off;
}
```

### 4.3 Apply & Verify

```bash
sudo nginx -t            # must print "syntax is ok"
sudo systemctl reload nginx
```

---

## 5. GitHub Actions Workflow

### 5.1 Required Secrets

| Secret | Description |
| ------ | ----------- |
| `HOST` | Hetzner server IP or hostname |
| `PORT` | SSH port, typically `22` |
| `SSHKEY` | SSH private key for the `deploy` user |
| `USERNAME` | `deploy` |
| `TARGETDIR` | Root web directory on the server (e.g. `/var/www/yigitlevent.com`) |
| `PRODUCTION_API_URL` | The public API URL the built client bundle should call, e.g. `https://yigitlevent.com/bwgrtools` — see 5.2's Build Client note below for why this can't come from the server's `.env` |

### 5.2 Workflow File

`.github/workflows/deploy.yml` — triggered on every push to `main` and manually via `workflow_dispatch` (no inputs).

**Jobs:**

1. **Build Client** — `npm ci` in `shared/` (so `tsc` can resolve types for `shared/`'s relatively-imported source, e.g. `dotenv`/`pino`/`pg`), then `npm ci && npm run build` in `client/` (this is not an npm-workspaces monorepo — each package has its own `package-lock.json` and is built independently, not via `--workspace=`), uploads `client/dist/` as artifact. The `npm run build` step needs `VITE_ENV: prod` and `VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}` set as step-level env vars — Vite reads `import.meta.env.VITE_*` and bakes the values into the built JS as literal strings at build time, so this has no relationship to the server's own `/opt/bwgrtools/.env` (that file is read at runtime by the API Node process running on the server, not by anything in this CI job).

2. **Build API** — same pattern (`npm ci` in `shared/`, then `npm ci && npm run build` in `api/`), uploads `api/dist/` + `package.json` / `package-lock.json` as artifact.

3. **Deploy** — runs after Build Client/API:
   - SSH via `webfactory/ssh-agent`
   - **Client**: `rsync` artifact → `TARGETDIR/bwgrtools/client/`
   - **API**: `rsync` artifact → `/opt/bwgrtools/api/`, then `npm ci --omit=dev` on server
   - **Shared**: always synced to `/opt/bwgrtools/shared/` (needed by the migration runner)
   - **Migrations**: runs `npx tsx db/migrate.ts` from `/opt/bwgrtools/shared` on the server — `shared/utils/env.ts`'s `dotenv` call loads `../.env` relative to `process.cwd()`, so this must run from `shared/` (matching PM2's `cwd: '/opt/bwgrtools/api'` for the same `../.env` resolution) rather than from `/opt/bwgrtools` directly
   - **PM2 restart**: `pm2 restart bwgrtools-api --update-env` (falls back to `pm2 start` if not running); then `pm2 save`

---

## 6. First Deployment Checklist

Work through this top to bottom the very first time. After that, every push to `main` is automatic.

### Server preparation (one-time, as root — handled by `initial_deployment.sh`)

- [ ] `setup-yigitlevent.md` completed (Nginx, UFW, certbot/SSL)
- [ ] Node.js 22, PostgreSQL 18, Docker, PM2 installed
- [ ] PostgreSQL user `bwgrtools` and database `bwgrtools` created
- [ ] pgAdmin Docker container running, bound to `127.0.0.1:5050`
- [ ] PostgreSQL `pg_hba.conf` allows Docker network connections
- [ ] UFW allows the Docker bridge subnet to reach Postgres: `ufw allow from 172.17.0.0/16 to any port 5432` (needed even though `pg_hba.conf`/`listen_addresses` are correct — UFW sits in front of both and default-denies otherwise)
- [ ] `deploy` user created
- [ ] Deploy SSH public key added to `/home/deploy/.ssh/authorized_keys`
- [ ] `deploy` added to `sshd_config`'s `AllowUsers` if that directive is present, and `MaxAuthTries` raised to at least 6 if set lower — otherwise CI's SSH agent can exhaust auth attempts before offering the right key, or the deploy user may be rejected outright as "not allowed" before key auth is even attempted
- [ ] `/opt/bwgrtools/` directory tree created, owned by `deploy`
- [ ] `TARGETDIR/bwgrtools/client/` created, owned by `deploy`
- [ ] `/var/log/bwgrtools/` created, owned by `deploy`
- [ ] `/opt/bwgrtools/.env` created with all production values (mode 600)
- [ ] `/opt/bwgrtools/ecosystem.config.cjs` created
- [ ] Migration runner dependencies installed: `cd /opt/bwgrtools && npm init -y && npm install pg tsx dotenv`
- [ ] PM2 startup script registered: `pm2 startup systemd -u deploy --hp /home/deploy`
- [ ] Nginx bwgrtools location blocks added and `nginx -t` passes

### GitHub (one-time)

- [ ] GitHub Secrets added: `HOST`, `PORT`, `SSHKEY`, `USERNAME`, `TARGETDIR`, `PRODUCTION_API_URL`
- [ ] `.github/workflows/deploy.yml` committed and pushed

### First workflow run

- [ ] Trigger manually via GitHub Actions → **Deploy** → **Run workflow**
- [ ] This syncs `shared/` to the server and runs `migrate.ts`, but on a brand-new database migrations will fail — `migrate.ts` only alters an existing schema, it doesn't create one. Bootstrap the database once (destructive; guarded by a `.reset` marker so it can't run twice):

  ```bash
  sudo -u deploy -i
  cd /opt/bwgrtools/shared
  npx tsx db/reset.ts
  exit
  ```

  Then re-run the failed workflow job (**Actions** → the failed run → **Re-run failed jobs**) so migrations complete against the now-bootstrapped schema.
- [ ] Workflow automatically applies all pending migrations before restarting services
- [ ] Start PM2 for the first time:

  ```bash
  su - deploy
  pm2 start /opt/bwgrtools/ecosystem.config.cjs
  pm2 save
  ```

- [ ] Verify processes: `pm2 status` (`bwgrtools-api` shows `online`)
- [ ] Verify site is live: `https://yigitlevent.com/bwgrtools`

---

## 7. Maintenance

### Viewing logs

```bash
# PM2 live log stream
pm2 logs

# API logs only
pm2 logs bwgrtools-api

# Last 200 lines
pm2 logs --lines 200

# Raw log files
tail -f /var/log/bwgrtools/api-out.log
tail -f /var/log/bwgrtools/api-error.log

# Nginx access log
tail -f /var/log/nginx/access.log
```

### Process management

```bash
pm2 status                         # overview of all processes
pm2 restart bwgrtools-api          # restart API
pm2 start /opt/bwgrtools/ecosystem.config.cjs  # start from config
```

### Manual re-deploy

To redeploy without a code change, trigger the workflow manually from GitHub Actions.

### Rotating logs

PM2 log rotation (install once):

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### pgAdmin

```bash
# View container status
docker ps -f name=pgadmin

# View pgAdmin logs
docker logs pgadmin --tail 100

# Restart pgAdmin
docker restart pgadmin

# Update pgAdmin to latest version
docker pull dpage/pgadmin4
docker stop pgadmin && docker rm pgadmin
docker run -d \
  --name pgadmin \
  --restart always \
  -e PGADMIN_DEFAULT_EMAIL=CHANGE_ME_PGADMIN_EMAIL \
  -e PGADMIN_DEFAULT_PASSWORD=YOUR_PASSWORD \
  -e SCRIPT_NAME=/pgadmin \
  -p 127.0.0.1:5050:80 \
  dpage/pgadmin4
```
