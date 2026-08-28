"use client";

import { useEffect, useRef, useState } from "react";

interface InconnuMsg {
  id?: number;
  role: "user" | "assistant" | "system";
  content: string;
}

interface InconnuConv {
  id: number;
  title: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<InconnuConv[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<InconnuMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat/conversations", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []));
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    fetch(`/api/chat/conversations/${activeConvId}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []));
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function createConversation() {
    const res = await fetch("/api/chat/conversations", { method: "POST", credentials: "include" });
    const data = await res.json();
    setConversations((prev) => [...prev, data.conversation]);
    setActiveConvId(data.conversation.id);
    setMessages([]);
  }

  async function sendMessage() {
    if (!input.trim()) return;
    let convId = activeConvId;
    if (!convId) {
      const res = await fetch("/api/chat/conversations", { method: "POST", credentials: "include" });
      const data = await res.json();
      convId = data.conversation.id;
      setConversations((prev) => [...prev, data.conversation]);
      setActiveConvId(convId);
    }

    const userMsg: InconnuMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ conversationId: convId, content: userMsg.content }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return setStreaming(false);

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const evt of events) {
        const line = evt.replace(/^data: /, "");
        if (!line) continue;
        const parsed = JSON.parse(line);
        if (parsed.token) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              ...copy[copy.length - 1],
              content: copy[copy.length - 1].content + parsed.token,
            };
            return copy;
          });
        }
      }
    }
    setStreaming(false);
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 220, borderRight: "1px solid var(--line)", padding: 16, background: "var(--panel)" }}>
        <button
          onClick={createConversation}
          style={{
            width: "100%",
            padding: "9px 10px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            background: "var(--panel-raised)",
            color: "var(--text)",
            fontSize: 13,
            cursor: "pointer",
            marginBottom: 14,
          }}
        >
          + New chat
        </button>
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveConvId(c.id)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 12.5,
              cursor: "pointer",
              color: c.id === activeConvId ? "var(--violet)" : "var(--text-dim)",
              background: c.id === activeConvId ? "var(--panel-raised)" : "transparent",
            }}
          >
            {c.title}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
          {messages.length === 0 && (
            <div style={{ color: "var(--text-dim)", fontSize: 13.5 }}>
              Say something to your Owner IA.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 20, maxWidth: 640 }}>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-display)",
                  color: m.role === "user" ? "var(--text-dim)" : "var(--violet)",
                  marginBottom: 4,
                }}
              >
                {m.role === "user" ? "YOU" : "INCONNU DARK IA"}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: 20, borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 10, maxWidth: 640 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !streaming && sendMessage()}
              placeholder="Message INCONNU DARK IA..."
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--panel)",
                color: "var(--text)",
                fontSize: 13.5,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={streaming}
              style={{
                padding: "0 18px",
                borderRadius: 8,
                border: "none",
                background: "var(--violet)",
                color: "#05050a",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {streaming ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
