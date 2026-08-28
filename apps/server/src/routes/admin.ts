import { Router } from "express";
import { db } from "../db/client.js";
import { inconnuUsers, inconnuApiKeys, inconnuConversations } from "../db/schema.js";
import { eq, count } from "drizzle-orm";
import { inconnuRequireAuth, inconnuRequireAdmin } from "../middleware/auth.js";

export const inconnuAdminRouter = Router();

inconnuAdminRouter.use(inconnuRequireAuth, inconnuRequireAdmin);

inconnuAdminRouter.get("/users", async (_req, res) => {
  const rows = await db
    .select({
      id: inconnuUsers.id,
      email: inconnuUsers.email,
      displayName: inconnuUsers.displayName,
      role: inconnuUsers.role,
      createdAt: inconnuUsers.createdAt,
    })
    .from(inconnuUsers);
  res.json({ users: rows });
});

inconnuAdminRouter.get("/stats", async (_req, res) => {
  const [{ userCount }] = await db
    .select({ userCount: count() })
    .from(inconnuUsers);
  const [{ keyCount }] = await db
    .select({ keyCount: count() })
    .from(inconnuApiKeys);
  const [{ convCount }] = await db
    .select({ convCount: count() })
    .from(inconnuConversations);

  res.json({ userCount, keyCount, convCount });
});

inconnuAdminRouter.patch("/users/:id/role", async (req, res) => {
  const role = req.body?.role;
  if (role !== "user" && role !== "admin") {
    return res.status(400).json({ error: "role must be 'user' or 'admin'" });
  }
  const [updated] = await db
    .update(inconnuUsers)
    .set({ role })
    .where(eq(inconnuUsers.id, Number(req.params.id)))
    .returning();
  res.json({ user: updated });
});
