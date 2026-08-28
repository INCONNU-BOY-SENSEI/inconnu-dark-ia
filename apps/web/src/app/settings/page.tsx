"use client";

import { useEffect, useState } from "react";

interface InconnuApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  revoked: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const [model, setModel] = useState("qwen2.5");
  const [temperature, setTemperature] = useState(70);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [saved, setSaved] = useState(false);

  const [keys, setKeys] = useState<InconnuApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setModel(d.settings.model);
          setTemperature(d.settings.temperature);
          setSystemPrompt(d.settings.systemPrompt || "");
        }
      });
    loadKeys();
  }, []);

  function loadKeys() {
    fetch("/api/keys", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setKeys(d.apiKeys || []));
  }

  async function saveSettings() {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ model, temperature, systemPrompt }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newKeyName }),
    });
    const data = await res.json();
    setRevealedKey(data.apiKey.fullKey);
    setNewKeyName("");
    loadKeys();
  }

  async function revokeKey(id: number) {
    await fetch(`/api/keys/${id}`, { method: "DELETE", credentials: "include" });
    loadKeys();
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 640 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22 }} className="inconnu-glow-text">
        Settings
      </h1>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 500 }}>Owner IA</h2>

        <label style={labelStyle}>Model</label>
        <input style={inputStyle} value={model} onChange={(e) => setModel(e.target.value)} />

        <label style={labelStyle}>Temperature ({(temperature / 100).toFixed(2)})</label>
        <input
          type="range"
          min={0}
          max={150}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          style={{ width: "100%" }}
        />

        <label style={labelStyle}>System prompt</label>
        <textarea
          style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />

        <button onClick={saveSettings} style={buttonStyle}>
          {saved ? "Saved" : "Save changes"}
        </button>
      </section>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 500 }}>API keys</h2>
        <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 16 }}>
          Use a key to call INCONNU DARK IA from your own projects via <code>POST /api/v1/chat</code>.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
            placeholder="Key name (e.g. my-bot)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <button onClick={createKey} style={{ ...buttonStyle, marginTop: 0, width: "auto", padding: "0 16px" }}>
            Create
          </button>
        </div>

        {revealedKey && (
          <div
            style={{
              background: "var(--panel-raised)",
              border: "1px solid var(--violet)",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              fontSize: 12.5,
              fontFamily: "var(--font-display)",
              wordBreak: "break-all",
            }}
          >
            {revealedKey}
            <div style={{ color: "var(--text-dim)", marginTop: 6, fontFamily: "var(--font-body)" }}>
              Copy this now — it won't be shown again.
            </div>
          </div>
        )}

        {keys.map((k) => (
          <div
            key={k.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 12px",
              border: "1px solid var(--line)",
              borderRadius: 8,
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <div>
              <div>{k.name}</div>
              <div style={{ color: "var(--text-dim)", fontSize: 11.5, fontFamily: "var(--font-display)" }}>
                {k.keyPrefix}...
              </div>
            </div>
            {!k.revoked ? (
              <button
                onClick={() => revokeKey(k.id)}
                style={{ background: "none", border: "none", color: "var(--crimson)", cursor: "pointer", fontSize: 12 }}
              >
                Revoke
              </button>
            ) : (
              <span style={{ color: "var(--text-dim)", fontSize: 11.5 }}>Revoked</span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "var(--text-dim)",
  marginTop: 14,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "var(--panel)",
  color: "var(--text)",
  fontSize: 13,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 18,
  padding: "10px 18px",
  borderRadius: 8,
  border: "none",
  background: "var(--violet)",
  color: "#05050a",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};
