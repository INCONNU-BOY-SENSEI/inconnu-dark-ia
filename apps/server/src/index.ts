import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { inconnuAuthRouter } from "./routes/auth.js";
import { inconnuChatRouter } from "./routes/chat.js";
import { inconnuApiKeysRouter } from "./routes/apiKeys.js";
import { inconnuSettingsRouter } from "./routes/settings.js";
import { inconnuAdminRouter } from "./routes/admin.js";
import { inconnuRequireApiKey } from "./middleware/auth.js";
import { db } from "./db/client.js";
import { inconnuSettings } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { inconnuOllamaChat } from "./lib/ollama.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "INCONNU DARK IA" }));

app.use("/api/auth", inconnuAuthRouter);
app.use("/api/chat", inconnuChatRouter);
app.use("/api/keys", inconnuApiKeysRouter);
app.use("/api/settings", inconnuSettingsRouter);
app.use("/api/admin", inconnuAdminRouter);

// Public integration endpoint — for users embedding INCONNU DARK IA in their own projects via API key.
app.post("/api/v1/chat", inconnuRequireApiKey, async (req, res) => {
  const { message, model } = req.body || {};
  if (!message) return res.status(400).json({ error: "message is required" });

  const [settings] = await db
    .select()
    .from(inconnuSettings)
    .where(eq(inconnuSettings.userId, req.inconnuApiKeyUserId!))
    .limit(1);

  const reply = await inconnuOllamaChat(
    model || settings?.model || "qwen2.5",
    [
      { role: "system", content: settings?.systemPrompt || "You are INCONNU DARK IA." },
      { role: "user", content: message },
    ],
    (settings?.temperature ?? 70) / 100,
    () => {} // non-streaming for the public API
  );

  res.json({ reply });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[inconnu] server listening on port ${PORT}`);
});
