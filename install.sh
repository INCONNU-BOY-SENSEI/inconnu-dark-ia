#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  INCONNU DARK IA — one-command installer
#  Usage: curl -fsSL <raw-url>/install.sh | sudo bash
# ============================================================

REPO_URL="${INCONNU_REPO_URL:-https://github.com/INCONNU-BOY-SENSEI/inconnu-dark-ia.git}"
INSTALL_DIR="/opt/inconnu-dark-ia"

# When piped through `curl | bash`, stdin is the script itself — reading
# prompts from stdin would consume the rest of the script instead of
# waiting for real keyboard input. Always read from the controlling
# terminal directly, and fall back to env vars / defaults if there is none
# (e.g. running fully non-interactively).
TTY="/dev/tty"
HAS_TTY=true
if [ ! -e "$TTY" ] || ! [ -t 0 ] && ! [ -r "$TTY" ]; then
  HAS_TTY=false
fi

inconnu_prompt() {
  # $1=prompt  $2=default  $3=env var name to check first
  local prompt="$1" default="$2" envval="$3" reply
  if [ -n "$envval" ]; then
    echo "$envval"
    return
  fi
  if [ "$HAS_TTY" = true ]; then
    read -rp "$prompt" reply < "$TTY" || reply=""
  fi
  echo "${reply:-$default}"
}

inconnu_prompt_secret() {
  local prompt="$1" envval="$2" reply
  if [ -n "$envval" ]; then
    echo "$envval"
    return
  fi
  if [ "$HAS_TTY" = true ]; then
    read -rsp "$prompt" reply < "$TTY" || reply=""
    echo "" >&2
  fi
  echo "$reply"
}

echo "[inconnu] INCONNU DARK IA installer starting..."

# 1. Dependencies (Docker + Compose plugin)
if ! command -v docker &> /dev/null; then
  echo "[inconnu] installing Docker..."
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version &> /dev/null; then
  echo "[inconnu] installing docker compose plugin..."
  apt-get update -y && apt-get install -y docker-compose-plugin
fi

# 2. Fetch the project
if [ -d "$INSTALL_DIR" ]; then
  echo "[inconnu] existing install found, pulling latest..."
  cd "$INSTALL_DIR" && git pull
else
  echo "[inconnu] cloning project into $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# 3. Generate .env if missing (written directly — never sed user input,
#    a password or domain could contain characters that break a sed pattern)
if [ ! -f .env ]; then
  echo "[inconnu] generating .env..."

  RANDOM_JWT=$(openssl rand -hex 32)
  RANDOM_PG=$(openssl rand -hex 16)

  ADMIN_EMAIL_INPUT=$(inconnu_prompt "Admin email [inconnuboytech@gmail.com]: " "inconnuboytech@gmail.com" "${ADMIN_EMAIL:-}")
  ADMIN_PASSWORD_INPUT=$(inconnu_prompt_secret "Admin password (blank = random): " "${ADMIN_PASSWORD:-}")
  if [ -z "$ADMIN_PASSWORD_INPUT" ]; then
    ADMIN_PASSWORD_INPUT=$(openssl rand -base64 18)
    echo "[inconnu] generated admin password: $ADMIN_PASSWORD_INPUT"
    echo "[inconnu] (also saved in .env — copy it now)"
  fi
  WEB_ORIGIN_INPUT=$(inconnu_prompt "Public domain or IP, e.g. https://ai.example.com [http://localhost:3000]: " "http://localhost:3000" "${WEB_ORIGIN:-}")

  cat > .env <<EOF
# --- Database ---
POSTGRES_USER=inconnu
POSTGRES_PASSWORD=${RANDOM_PG}
POSTGRES_DB=inconnu_dark_ia

# --- Auth ---
JWT_SECRET=${RANDOM_JWT}

# --- Admin account (auto-seeded on first boot) ---
ADMIN_EMAIL=${ADMIN_EMAIL_INPUT}
ADMIN_PASSWORD=${ADMIN_PASSWORD_INPUT}

# --- IA model served by Ollama ---
OLLAMA_MODEL=qwen2.5

# --- Web origin (used for CORS) ---
WEB_ORIGIN=${WEB_ORIGIN_INPUT}
EOF
  chmod 600 .env
else
  echo "[inconnu] .env already exists, keeping it."
fi

# 4. Build and start everything (Postgres, Ollama, server, web)
echo "[inconnu] building and starting containers..."
docker compose up -d --build

# 5. Wait for Postgres, then run migrations + seed the admin account
echo "[inconnu] waiting for database..."
until docker compose exec -T postgres pg_isready -U "$(grep POSTGRES_USER .env | cut -d= -f2)" &> /dev/null; do
  sleep 2
done

echo "[inconnu] running migrations..."
docker compose exec -T server npm run db:migrate

echo "[inconnu] seeding admin account..."
docker compose exec -T server npm run db:seed

echo ""
echo "============================================================"
echo " INCONNU DARK IA is live."
echo " Web:    http://$(curl -s ifconfig.me):3000"
echo " API:    http://$(curl -s ifconfig.me):4000"
echo " Admin:  $(grep ADMIN_EMAIL .env | cut -d= -f2)"
echo "============================================================"
