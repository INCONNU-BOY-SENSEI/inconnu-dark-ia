import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client.js";
import {
  inconnuConversations,
  inconnuMessages,
  inconnuSettings,
} from "../db/schema.js";
import { eq, and, asc } from "drizzle-orm";
import { inconnuRequireAuth } from "../middleware/auth.js";
import { inconnuOllamaChat } from "../lib/ollama.js";

export const inconnuChatRouter = Router();

inconnuChatRouter.use(inconnuRequireAuth);

// List conversations for the logged-in user
inconnuChatRouter.get("/conversations", async (req, res) => {
  const rows = await db
    .select()
    .from(inconnuConversations)
    .where(eq(inconnuConversations.userId, req.inconnuUser!.userId))
    .orderBy(asc(inconnuConversations.createdAt));
  res.json({ conversations: rows });
});

inconnuChatRouter.post("/conversations", async (req, res) => {
  const [conv] = await db
    .insert(inconnuConversations)
    .values({ userId: req.inconnuUser!.userId, title: "New chat" })
    .returning();
  res.status(201).json({ conversation: conv });
});

inconnuChatRouter.get("/conversations/:id/messages", async (req, res) => {
  const convId = Number(req.params.id);
  const rows = await db
    .select()
    .from(inconnuMessages)
    .where(eq(inconnuMessages.conversationId, convId))
    .orderBy(asc(inconnuMessages.createdAt));
  res.json({ messages: rows });
});

const sendSchema = z.object({
  conversationId: z.number(),
  content: z.string().min(1),
});

// Streams the assistant's reply as Server-Sent Events (SSE).
inconnuChatRouter.post("/send", async (req, res) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { conversationId, content } = parsed.data;
  const userId = req.inconnuUser!.userId;

  const [conv] = await db
    .select()
    .from(inconnuConversations)
    .where(
      and(
        eq(inconnuConversations.id, conversationId),
        eq(inconnuConversations.userId, userId)
      )
    )
    .limit(1);

  if (!conv) return res.status(404).json({ error: "Conversation not found" });

  await db.insert(inconnuMessages).values({
    conversationId,
    role: "user",
    content,
  });

  const [settings] = await db
    .select()
    .from(inconnuSettings)
    .where(eq(inconnuSettings.userId, userId))
    .limit(1);

  const history = await db
    .select()
    .from(inconnuMessages)
    .where(eq(inconnuMessages.conversationId, conversationId))
    .orderBy(asc(inconnuMessages.createdAt));

  const ollamaMessages = [
    { role: "system" as const, content: settings?.systemPrompt || "You are INCONNU DARK IA." },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const fullReply = await inconnuOllamaChat(
      settings?.model || "qwen2.5",
      ollamaMessages,
      (settings?.temperature ?? 70) / 100,
      (token) => {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    );

    await db.insert(inconnuMessages).values({
      conversationId,
      role: "assistant",
      content: fullReply,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "IA generation failed" })}\n\n`);
    res.end();
  }
});
