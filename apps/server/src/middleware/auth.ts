import type { Request, Response, NextFunction } from "express";
import { inconnuVerifyToken, type InconnuJwtPayload } from "../lib/auth.js";
import { db } from "../db/client.js";
import { inconnuApiKeys } from "../db/schema.js";
import { inconnuHashApiKey } from "../lib/apiKey.js";
import { eq } from "drizzle-orm";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      inconnuUser?: InconnuJwtPayload;
      inconnuApiKeyUserId?: number;
    }
  }
}

// Requires a logged-in dashboard session (JWT cookie or bearer token).
export function inconnuRequireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.inconnu_token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    req.inconnuUser = inconnuVerifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

export function inconnuRequireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.inconnuUser?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// For external integrations calling the API with an INCONNU DARK IA key.
export async function inconnuRequireApiKey(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const key = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!key || !key.startsWith("idk-live-")) {
    return res.status(401).json({ error: "Missing or invalid API key" });
  }

  const keyHash = inconnuHashApiKey(key);
  const [record] = await db
    .select()
    .from(inconnuApiKeys)
    .where(eq(inconnuApiKeys.keyHash, keyHash))
    .limit(1);

  if (!record || record.revoked) {
    return res.status(401).json({ error: "Invalid or revoked API key" });
  }

  req.inconnuApiKeyUserId = record.userId;
  next();
}
