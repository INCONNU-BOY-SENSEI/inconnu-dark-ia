# INCONNU DARK IA

AI platform by **INCONNU BOY SENSEI** — your own "Owner IA" running on Ollama + Qwen.

## Stack

- `apps/web` — Next.js 14 (App Router): Home, Login, Signup, Chat, Settings, Docs, Profile, Admin
- `apps/server` — Express + Drizzle ORM + Postgres: auth, chat, API keys, admin
- `ollama` — serves the Qwen model locally, no external API calls
- Docker Compose ties it all together; `install.sh` sets up a fresh VPS in one command

## One-command install (VPS)

```bash
curl -fsSL https://raw.githubusercontent.com/INCONNU-BOY-SENSEI/inconnu-dark-ia/main/install.sh | sudo bash
```

This installs Docker if missing, clones the repo, generates a `.env` (prompting for
admin email/password and your public domain), then builds and starts Postgres,
Ollama (pulling the Qwen model), the API server, and the web app — and runs
migrations + seeds the admin account automatically.

To update later:

```bash
sudo bash /opt/inconnu-dark-ia/update.sh
```

## Local development

```bash
cp .env.example .env   # fill in values
npm install
docker compose up -d postgres ollama
npm run db:migrate
npm run db:seed
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4000

## API integration

Any user can generate a key from **Settings → API keys**, then call:

```
POST /api/v1/chat
Authorization: Bearer idk-live-xxxx
{ "message": "Hello" }
```

See the in-app **Docs** page for the full reference.
