"use client";

import { useEffect, useState } from "react";

interface InconnuUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<InconnuUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setDisplayName(d.user?.displayName || "");
      });
  }, []);

  async function save() {
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ displayName }),
    });
    const data = await res.json();
    setUser(data.user);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!user) return <div style={{ padding: 48, color: "var(--text-dim)" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px 48px", maxWidth: 480 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22 }} className="inconnu-glow-text">
        Profile
      </h1>

      <div
        style={{
          marginTop: 24,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--violet), var(--crimson))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: 22,
        }}
      >
        {user.displayName.charAt(0).toUpperCase()}
      </div>

      <label style={{ display: "block", fontSize: 12, color: "var(--text-dim)", marginTop: 24, marginBottom: 6 }}>
        Display name
      </label>
      <input
        style={{
          width: "100%",
          padding: "9px 11px",
          borderRadius: 8,
          border: "1px solid var(--line)",
          background: "var(--panel)",
          color: "var(--text)",
          fontSize: 13,
        }}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />

      <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-dim)" }}>
        <div>Email: {user.email}</div>
        <div>Role: {user.role}</div>
        <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
      </div>

      <button
        onClick={save}
        style={{
          marginTop: 20,
          padding: "10px 18px",
          borderRadius: 8,
          border: "none",
          background: "var(--violet)",
          color: "#05050a",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}
