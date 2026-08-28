#!/usr/bin/env bash
set -euo pipefail

cd /opt/inconnu-dark-ia
echo "[inconnu] pulling latest code..."
git pull

echo "[inconnu] rebuilding containers..."
docker compose up -d --build

echo "[inconnu] running migrations..."
docker compose exec -T server npm run db:migrate

echo "[inconnu] update complete."
