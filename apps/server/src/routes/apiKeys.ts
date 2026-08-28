import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client.js";
import { inconnuApiKeys } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { inconnuRequireAuth } from "../middleware/auth.js";
import { inconnuGenerateApiKey, inconnuHashApiKey } from "../lib/apiKey.js";

export const inconnuApiKeysRouter = Router();

inconnuApiKeysRouter.use(inconnuRequireAuth);

inconnuApiKeysRouter.get("/", async (req, res) => {
  const rows = await db
    .select({
      id: inconnuApiKeys.id,
      name: inconnuApiKeys.name,
      keyPrefix: inconnuApiKeys.keyPrefix,
      revoked: inconnuApiKeys.revoked,
      lastUsedAt: inconnuApiKeys.lastUsedAt,
      createdAt: inconnuApiKeys.createdAt,
    })
    .from(inconnuApiKeys)
    .where(eq(inconnuApiKeys.userId, req.inconnuUser!.userId));
  res.json({ apiKeys: rows });
});

const createSchema = z.object({ name: z.string().min(1).max(100) });

inconnuApiKeysRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { fullKey, prefix } = inconnuGenerateApiKey();
  const keyHash = inconnuHashApiKey(fullKey);

  const [record] = await db
    .insert(inconnuApiKeys)
    .values({
      userId: req.inconnuUser!.userId,
      name: parsed.data.name,
      keyPrefix: prefix,
      keyHash,
    })
    .returning();

  // fullKey is only ever shown once, at creation time.
  res.status(201).json({ apiKey: { ...record, fullKey } });
});

inconnuApiKeysRouter.delete("/:id", async (req, res) => {
  await db
    .update(inconnuApiKeys)
    .set({ revoked: true })
    .where(
      and(
        eq(inconnuApiKeys.id, Number(req.params.id)),
        eq(inconnuApiKeys.userId, req.inconnuUser!.userId)
      )
    );
  res.json({ ok: true });
});
