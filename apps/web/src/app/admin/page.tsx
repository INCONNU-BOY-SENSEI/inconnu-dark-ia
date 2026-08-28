"use client";

import { useEffect, useState } from "react";

interface InconnuAdminUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<InconnuAdminUser[]>([]);
  const [stats, setStats] = useState<{ userCount: number; keyCount: number; convCount: number } | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" }).then((r) => {
      if (r.status === 403) return setForbidden(true);
      r.json().then(setStats);
    });
    fetch("/api/admin/users", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []));
  }, []);

  if (forbidden) {
    return (
      <div style={{ padding: 48, color: "var(--crimson)", fontSize: 14 }}>
        Admin access required.
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 780 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22 }} className="inconnu-glow-text">
        Admin
      </h1>

      {stats && (
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          {[
            { label: "Users", value: stats.userCount },
            { label: "API keys", value: stats.keyCount },
            { label: "Conversations", value: stats.convCount },
          ].map((s) => (
            <div
              key={s.label}
              style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "16px 20px", background: "var(--panel)" }}
            >
              <div style={{ fontSize: 24, fontFamily: "var(--font-display)", color: "var(--violet)" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 36, fontWeight: 500 }}>Users</h2>
      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left", color: "var(--text-dim)" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid var(--line)" }}>
              <td style={tdStyle}>{u.displayName}</td>
              <td style={tdStyle}>{u.email}</td>
              <td style={tdStyle}>{u.role}</td>
              <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "8px 10px", fontWeight: 500 };
const tdStyle: React.CSSProperties = { padding: "8px 10px" };
