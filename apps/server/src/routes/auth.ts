import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client.js";
import { inconnuUsers, inconnuSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import {
  inconnuHashPassword,
  inconnuComparePassword,
  inconnuSignToken,
} from "../lib/auth.js";
import { inconnuRequireAuth } from "../middleware/auth.js";

export const inconnuAuthRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(100),
});

inconnuAuthRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, displayName } = parsed.data;

  const existing = await db
    .select()
    .from(inconnuUsers)
    .where(eq(inconnuUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await inconnuHashPassword(password);
  const [user] = await db
    .insert(inconnuUsers)
    .values({ email, passwordHash, displayName, role: "user" })
    .returning();

  await db.insert(inconnuSettings).values({ userId: user.id });

  const token = inconnuSignToken({
    userId: user.id,
    email: user.email,
    role: user.role as "user" | "admin",
  });

  res
    .cookie("inconnu_token", token, { httpOnly: true, sameSite: "lax" })
    .status(201)
    .json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

inconnuAuthRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(inconnuUsers)
    .where(eq(inconnuUsers.email, email))
    .limit(1);

  if (!user || !(await inconnuComparePassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = inconnuSignToken({
    userId: user.id,
    email: user.email,
    role: user.role as "user" | "admin",
  });

  res
    .cookie("inconnu_token", token, { httpOnly: true, sameSite: "lax" })
    .json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
});

inconnuAuthRouter.get("/me", inconnuRequireAuth, async (req, res) => {
  const [user] = await db
    .select({
      id: inconnuUsers.id,
      email: inconnuUsers.email,
      displayName: inconnuUsers.displayName,
      role: inconnuUsers.role,
      avatarUrl: inconnuUsers.avatarUrl,
      createdAt: inconnuUsers.createdAt,
    })
    .from(inconnuUsers)
    .where(eq(inconnuUsers.id, req.inconnuUser!.userId))
    .limit(1);

  res.json({ user });
});

inconnuAuthRouter.post("/logout", (_req, res) => {
  res.clearCookie("inconnu_token").json({ ok: true });
});
