import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client.js";
import { inconnuSettings, inconnuUsers } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { inconnuRequireAuth } from "../middleware/auth.js";

export const inconnuSettingsRouter = Router();

inconnuSettingsRouter.use(inconnuRequireAuth);

inconnuSettingsRouter.get("/", async (req, res) => {
  const [settings] = await db
    .select()
    .from(inconnuSettings)
    .where(eq(inconnuSettings.userId, req.inconnuUser!.userId))
    .limit(1);
  res.json({ settings });
});

const updateSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().min(0).max(200).optional(),
  systemPrompt: z.string().max(2000).optional(),
});

inconnuSettingsRouter.patch("/", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [updated] = await db
    .update(inconnuSettings)
    .set(parsed.data)
    .where(eq(inconnuSettings.userId, req.inconnuUser!.userId))
    .returning();

  res.json({ settings: updated });
});

const profileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

inconnuSettingsRouter.patch("/profile", async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [updated] = await db
    .update(inconnuUsers)
    .set(parsed.data)
    .where(eq(inconnuUsers.id, req.inconnuUser!.userId))
    .returning();

  res.json({ user: updated });
});
