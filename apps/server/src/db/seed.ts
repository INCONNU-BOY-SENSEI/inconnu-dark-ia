import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./client.js";
import { inconnuUsers, inconnuSettings } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("[inconnu] ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin seed.");
    return;
  }

  const existing = await db
    .select()
    .from(inconnuUsers)
    .where(eq(inconnuUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[inconnu] admin ${email} already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(inconnuUsers)
    .values({
      email,
      passwordHash,
      displayName: "INCONNU BOY SENSEI",
      role: "admin",
    })
    .returning();

  await db.insert(inconnuSettings).values({ userId: user.id });

  console.log(`[inconnu] admin account created: ${email}`);
}

main()
  .catch((err) => {
    console.error("[inconnu] seed failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
