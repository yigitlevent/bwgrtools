#!/usr/bin/env bash
# Run as root on a Hetzner Ubuntu server where setup-yigitlevent.md has already been completed
# (Nginx, UFW, certbot/SSL are already configured).
#
# Covers every one-time step in .scripts/initial_deployment.md sections 1-4.
# The GitHub Actions workflow (section 5) and first workflow run (section 6)
# must be completed manually afterward.

set -euo pipefail

# ─── colours ────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[info]${RESET}  $*"; }
success() { echo -e "${GREEN}[ok]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[warn]${RESET}  $*"; }
die()     { echo -e "${RED}[error]${RESET} $*" >&2; exit 1; }
section() { echo -e "\n${BOLD}━━━  $*  ━━━${RESET}"; }

# ─── root check ─────────────────────────────────────────────────────────────
[[ $EUID -eq 0 ]] || die "This script must be run as root."

# ─── collect config ─────────────────────────────────────────────────────────
section "Configuration"

read -rp "Domain name (e.g. example.com, no www prefix): " DOMAIN
[[ -n "$DOMAIN" ]] || die "Domain cannot be empty."

NGINX_CONF=/etc/nginx/sites-available/$DOMAIN
[[ -f "$NGINX_CONF" ]] || die "Nginx config not found at $NGINX_CONF — run setup-yigitlevent.md first."

read -rsp "PostgreSQL password for the 'bwgrtools' user: " DB_PASS; echo
[[ -n "$DB_PASS" ]] || die "DB password cannot be empty."

read -rsp "Confirm PostgreSQL password: " DB_PASS2; echo
[[ "$DB_PASS" == "$DB_PASS2" ]] || die "Passwords do not match."

read -rsp "pgAdmin login password: " PGADMIN_PASS; echo
[[ -n "$PGADMIN_PASS" ]] || die "pgAdmin password cannot be empty."

read -rp "pgAdmin login email (must be a real, non-reserved domain — not .local/.test/.invalid): " PGADMIN_EMAIL
[[ -n "$PGADMIN_EMAIL" ]] || die "pgAdmin email cannot be empty."

read -rp "Deploy user's SSH public key (paste the full ed25519 line): " DEPLOY_PUBKEY
[[ -n "$DEPLOY_PUBKEY" ]] || die "SSH public key cannot be empty."

echo
info "Domain:    $DOMAIN"
info "DB user:   bwgrtools"
info "Deploy user: deploy"
info "pgAdmin email: $PGADMIN_EMAIL"
echo

# ─── 1.1 system packages ────────────────────────────────────────────────────
section "1.1 System packages"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl git build-essential
success "System packages installed."

# ─── 1.2 Node.js 22 ─────────────────────────────────────────────────────────
section "1.2 Node.js 22"
if node --version 2>/dev/null | grep -q '^v22'; then
  success "Node.js 22 already installed: $(node --version)"
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
  node --version | grep -q '^v22' || die "Node.js 22 installation failed."
  success "Node.js installed: $(node --version)"
fi

# ─── 1.3 PostgreSQL 18 ──────────────────────────────────────────────────────
section "1.3 PostgreSQL 18"
if ! apt-cache show postgresql-18 &>/dev/null; then
  info "postgresql-18 not in default repos — adding the PGDG APT repository."
  install -d /usr/share/postgresql-common/pgdg
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo "$VERSION_CODENAME")-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -qq
fi
apt-get install -y -qq postgresql-18 postgresql-client-18
systemctl enable --now postgresql
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bwgrtools'" \
  | grep -q 1 && info "Role 'bwgrtools' already exists, skipping creation." || \
  sudo -u postgres psql -c "CREATE USER bwgrtools WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='bwgrtools'" \
  | grep -q 1 && info "Database 'bwgrtools' already exists, skipping creation." || {
  sudo -u postgres psql -c "CREATE DATABASE bwgrtools OWNER bwgrtools;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bwgrtools TO bwgrtools;"
}
success "PostgreSQL ready."

# ─── 1.4 Docker & pgAdmin ───────────────────────────────────────────────────
section "1.4 Docker & pgAdmin"
if command -v docker &>/dev/null; then
  info "Docker already installed."
else
  apt-get install -y -qq docker.io
  systemctl enable --now docker
  success "Docker installed."
fi

if docker ps -a --format '{{.Names}}' | grep -q '^pgadmin$'; then
  info "pgAdmin container already exists — skipping creation."
else
  docker run -d \
    --name pgadmin \
    --restart always \
    -e PGADMIN_DEFAULT_EMAIL="$PGADMIN_EMAIL" \
    -e PGADMIN_DEFAULT_PASSWORD="$PGADMIN_PASS" \
    -e SCRIPT_NAME=/pgadmin \
    -p 127.0.0.1:5050:80 \
    dpage/pgadmin4
  success "pgAdmin container started on 127.0.0.1:5050."
fi

# Allow PostgreSQL connections from the Docker bridge network
PG_HBA=/etc/postgresql/18/main/pg_hba.conf
DOCKER_HBA_LINE="host    bwgrtools    bwgrtools    172.17.0.0/16    scram-sha-256"
if grep -qF "172.17.0.0/16" "$PG_HBA"; then
  info "Docker network already allowed in pg_hba.conf."
else
  echo "$DOCKER_HBA_LINE" >> "$PG_HBA"
  success "Docker network rule added to pg_hba.conf."
fi

PG_CONF=/etc/postgresql/18/main/postgresql.conf
DOCKER_BRIDGE_IP="172.17.0.1"
CURRENT_LISTEN=$(grep -E "^listen_addresses" "$PG_CONF" || true)
if echo "$CURRENT_LISTEN" | grep -q "$DOCKER_BRIDGE_IP"; then
  info "listen_addresses already includes Docker bridge IP."
elif [[ -n "$CURRENT_LISTEN" ]]; then
  # Append Docker bridge IP to existing listen_addresses
  sed -i "s|^listen_addresses\s*=\s*'\([^']*\)'|listen_addresses = '\1,$DOCKER_BRIDGE_IP'|" "$PG_CONF"
  success "Added $DOCKER_BRIDGE_IP to listen_addresses."
else
  echo "listen_addresses = 'localhost,$DOCKER_BRIDGE_IP'" >> "$PG_CONF"
  success "Set listen_addresses to 'localhost,$DOCKER_BRIDGE_IP'."
fi

systemctl restart postgresql
success "PostgreSQL restarted with Docker network access."

# Allow the Docker bridge network through the firewall to reach Postgres
if ufw status | grep -qF "172.17.0.0/16"; then
  info "UFW already allows the Docker bridge network to port 5432."
else
  ufw allow from 172.17.0.0/16 to any port 5432 >/dev/null
  success "UFW rule added: allow 172.17.0.0/16 to port 5432."
fi

# ─── 1.5 PM2 ────────────────────────────────────────────────────────────────
section "1.5 PM2"
npm install -g pm2 --loglevel=error
success "PM2 installed: $(pm2 --version)"

# ─── 2. deploy user & directories ───────────────────────────────────────────
section "2. Deploy user & directory structure"
id deploy &>/dev/null && info "User 'deploy' already exists." || \
  adduser --disabled-password --gecos "" deploy

mkdir -p /opt/bwgrtools/{api,shared}
chown -R deploy:deploy /opt/bwgrtools

mkdir -p /var/www/$DOMAIN/bwgrtools/client
chown -R deploy:deploy /var/www/$DOMAIN/bwgrtools

mkdir -p /var/log/bwgrtools
chown deploy:deploy /var/log/bwgrtools
success "Directories created."

# ─── 2.1 deploy SSH key ─────────────────────────────────────────────────────
section "2.1 Deploy SSH key"
mkdir -p /home/deploy/.ssh
AUTHKEYS=/home/deploy/.ssh/authorized_keys
touch "$AUTHKEYS"
if grep -qF "$DEPLOY_PUBKEY" "$AUTHKEYS"; then
  info "Public key already in authorized_keys."
else
  echo "$DEPLOY_PUBKEY" >> "$AUTHKEYS"
  success "Public key added."
fi
chmod 700 /home/deploy/.ssh
chmod 600 "$AUTHKEYS"
chown -R deploy:deploy /home/deploy/.ssh

# ─── 2.2 sshd_config — allow the deploy user, raise low MaxAuthTries ───────
section "2.2 sshd_config for deploy user"
SSHD_CONFIG=/etc/ssh/sshd_config
SSHD_RELOAD_NEEDED=false

if grep -qE '^AllowUsers' "$SSHD_CONFIG"; then
  if grep -E '^AllowUsers' "$SSHD_CONFIG" | grep -qw deploy; then
    info "'deploy' already listed in AllowUsers."
  else
    sed -i '/^AllowUsers/ s/$/ deploy/' "$SSHD_CONFIG"
    success "Added 'deploy' to AllowUsers."
    SSHD_RELOAD_NEEDED=true
  fi
else
  info "No AllowUsers directive present — all users allowed by default, nothing to change."
fi

CURRENT_MAX_AUTH_TRIES=$(grep -E '^MaxAuthTries' "$SSHD_CONFIG" | awk '{print $2}' || true)
if [[ -n "$CURRENT_MAX_AUTH_TRIES" && "$CURRENT_MAX_AUTH_TRIES" -lt 6 ]]; then
  # A low MaxAuthTries (e.g. 2) can exhaust the CI SSH agent's auth attempts
  # before it offers the correct key, especially if other identities are
  # loaded first — 6 is OpenSSH's own compiled-in default.
  sed -i "s/^MaxAuthTries .*/MaxAuthTries 6/" "$SSHD_CONFIG"
  success "Raised MaxAuthTries from $CURRENT_MAX_AUTH_TRIES to 6."
  SSHD_RELOAD_NEEDED=true
else
  info "MaxAuthTries already sufficient (or unset, using OpenSSH default)."
fi

if [[ "$SSHD_RELOAD_NEEDED" == true ]]; then
  sshd -t || die "sshd_config syntax check failed after edits."
  systemctl restart ssh
  success "sshd_config updated and ssh service restarted."
fi

# ─── 3.1 .env file ──────────────────────────────────────────────────────────
section "3.1 Environment variables"
ENV_FILE=/opt/bwgrtools/.env
cat > "$ENV_FILE" <<EOF
# Environment — must be "prod" for SSL DB connections
VITE_ENV=prod

# API
API_PORT=3001
API_INTERNAL_URL=http://127.0.0.1:3001
CLIENT_URL=https://$DOMAIN/bwgrtools

# Database
DB_USER=bwgrtools
DB_PASS=$DB_PASS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bwgrtools
PGPOOL_MAX=10
EOF
chown deploy:deploy "$ENV_FILE"
chmod 600 "$ENV_FILE"
success ".env written to $ENV_FILE"

# ─── 3.2 PM2 ecosystem config ───────────────────────────────────────────────
section "3.2 PM2 ecosystem config"
cat > /opt/bwgrtools/ecosystem.config.cjs <<'EOF'
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
EOF
chown deploy:deploy /opt/bwgrtools/ecosystem.config.cjs
success "ecosystem.config.cjs written."

# ─── 3.3 migration runner deps ──────────────────────────────────────────────
section "3.3 Migration runner dependencies"
su - deploy -c "cd /opt/bwgrtools && npm init -y --loglevel=error && npm install pg tsx dotenv --loglevel=error"
success "pg, tsx, and dotenv packages installed in /opt/bwgrtools."

# ─── 4.1 Nginx — location blocks (bwgrtools + pgAdmin) ────────────────────
section "4.1 Nginx — location blocks"

if grep -q '/bwgrtools/' "$NGINX_CONF" && grep -q '/pgadmin/' "$NGINX_CONF"; then
  info "Location blocks already present — skipping."
else
  # Build the snippet to inject
  SNIPPET=$(cat <<'BLOCK'

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
    location = /bwgrtools {
        return 301 /bwgrtools/;
    }

    # bwgrtools — static client SPA
    location /bwgrtools/ {
        alias /var/www/DOMAIN_PLACEHOLDER/bwgrtools/client/;
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
BLOCK
  )
  SNIPPET="${SNIPPET//DOMAIN_PLACEHOLDER/$DOMAIN}"

  # Insert before the first closing brace of the first server block
  awk -v snippet="$SNIPPET" '
    /^}/ && !done { print snippet; done=1 }
    { print }
  ' "$NGINX_CONF" > "${NGINX_CONF}.tmp"
  mv "${NGINX_CONF}.tmp" "$NGINX_CONF"

  success "Location blocks (bwgrtools + pgAdmin) injected into $NGINX_CONF."
fi

nginx -t || die "Nginx config test failed."
systemctl reload nginx
success "Nginx configured."

# ─── 4.2 PM2 startup ────────────────────────────────────────────────────────
section "4.2 PM2 startup (systemd)"
STARTUP_CMD=$(sudo -u deploy bash -c 'pm2 startup systemd -u deploy --hp /home/deploy' \
  | grep -E '^(sudo )?env PATH=' || true)

if [[ -n "$STARTUP_CMD" ]]; then
  eval "$STARTUP_CMD"
else
  warn "Could not parse 'pm2 startup' output — falling back to a direct call."
  env PATH="$PATH:/usr/bin" pm2 startup systemd -u deploy --hp /home/deploy
fi

if systemctl is-enabled pm2-deploy &>/dev/null; then
  success "PM2 startup registered."
else
  die "PM2 startup registration failed — 'systemctl is-enabled pm2-deploy' did not report enabled."
fi

# ─── PM2 log rotation ───────────────────────────────────────────────────────
section "PM2 log rotation"
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
success "Log rotation configured."

# ─── done ───────────────────────────────────────────────────────────────────
section "Initial deployment complete"
echo -e "${GREEN}${BOLD}"
cat <<'SUMMARY'
  Server-side setup is done. Remaining manual steps:

  GitHub (one-time):
    1. Add GitHub Secrets: HOST, PORT, SSHKEY, USERNAME (deploy), TARGETDIR, PRODUCTION_API_URL
    2. Commit and push .github/workflows/deploy.yml

  First workflow run:
    3. Trigger manually via GitHub Actions → Deploy → Run workflow
       This syncs shared/ to /opt/bwgrtools/shared/ and runs migrate.ts, but
       migrate.ts only ALTERs an existing schema — on a brand-new database
       migrations will fail until the schemas themselves are created (next step).
    4. Once shared/ has synced (even if the migration step above failed),
       bootstrap the empty database once — this is destructive and guarded
       by a .reset marker, so it only runs a single time:
         sudo -u deploy -i
         cd /opt/bwgrtools/shared
         npx tsx db/reset.ts
         exit
       Then re-run the failed workflow job so migrations complete.
    5. After the workflow completes, SSH in as 'deploy' and run:
         pm2 start /opt/bwgrtools/ecosystem.config.cjs
         pm2 save
    6. Verify: pm2 status   (bwgrtools-api should show 'online')
    7. Visit: https://DOMAIN/bwgrtools

SUMMARY
echo -e "${RESET}"
info "pgAdmin is available at https://$DOMAIN/pgadmin"
info "pgAdmin login: $PGADMIN_EMAIL / (the password you entered)"
