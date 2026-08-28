import { nanoid } from "nanoid";
import crypto from "node:crypto";

// Format: idk-live-<32 random chars>. "idk" = INCONNU DARK IA
export function inconnuGenerateApiKey(): { fullKey: string; prefix: string } {
  const secret = nanoid(32);
  const fullKey = `idk-live-${secret}`;
  const prefix = fullKey.slice(0, 12);
  return { fullKey, prefix };
}

export function inconnuHashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
