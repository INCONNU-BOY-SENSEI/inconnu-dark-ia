import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
} from "drizzle-orm/pg-core";

export const inconnuUsers = pgTable("inconnu_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // "user" | "admin"
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inconnuApiKeys = pgTable("inconnu_api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => inconnuUsers.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 12 }).notNull(),
  keyHash: text("key_hash").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inconnuConversations = pgTable("inconnu_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => inconnuUsers.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull().default("New chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inconnuMessages = pgTable("inconnu_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => inconnuConversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant" | "system"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inconnuSettings = pgTable("inconnu_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => inconnuUsers.id, { onDelete: "cascade" })
    .unique(),
  model: varchar("model", { length: 50 }).notNull().default("qwen2.5"),
  temperature: integer("temperature").notNull().default(70), // stored *100, e.g. 0.70
  systemPrompt: text("system_prompt").default(
    "You are INCONNU DARK IA, created by INCONNU BOY SENSEI."
  ),
});
