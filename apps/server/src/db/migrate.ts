import "dotenv/config";
import pg from "pg";

const SQL = `
CREATE TABLE IF NOT EXISTS inconnu_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inconnu_api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES inconnu_users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(12) NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at TIMESTAMP,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inconnu_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES inconnu_users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inconnu_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES inconnu_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inconnu_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES inconnu_users(id) ON DELETE CASCADE,
  model VARCHAR(50) NOT NULL DEFAULT 'qwen2.5',
  temperature INTEGER NOT NULL DEFAULT 70,
  system_prompt TEXT DEFAULT 'You are INCONNU DARK IA, created by INCONNU BOY SENSEI.'
);
`;

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  console.log("[inconnu] running migrations...");
  await pool.query(SQL);
  console.log("[inconnu] migrations complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("[inconnu] migration failed:", err);
  process.exit(1);
});
