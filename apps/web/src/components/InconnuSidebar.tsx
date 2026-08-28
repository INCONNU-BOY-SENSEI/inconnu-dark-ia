"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: "◆" },
  { href: "/settings", label: "Settings", icon: "⚙" },
  { href: "/docs", label: "Docs", icon: "▤" },
  { href: "/profile", label: "Profile", icon: "◉" },
];

export function InconnuSidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside
      style={{
        width: 220,
        borderRight: "1px solid var(--line)",
        background: "var(--panel)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <Link href="/" style={{ marginBottom: 32, display: "block" }}>
        <span className="inconnu-glow-text" style={{ fontSize: 15, fontWeight: 700 }}>
          INCONNU DARK IA
        </span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 13.5,
              color: "var(--text-dim)",
            }}
            className="inconnu-nav-link"
          >
            <span style={{ opacity: 0.8 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ position: "relative", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
            border: "none",
            padding: "8px 10px",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          <span style={{ fontSize: 13 }}>Account</span>
          <span style={{ fontSize: 16, letterSpacing: -1 }}>⋮</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              marginBottom: 6,
              background: "var(--panel-raised)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "var(--glow)",
            }}
          >
            <Link href="/profile" className="inconnu-menu-item" style={menuItemStyle}>
              Profile
            </Link>
            <Link href="/settings" className="inconnu-menu-item" style={menuItemStyle}>
              Settings
            </Link>
            <Link href="/admin" className="inconnu-menu-item" style={menuItemStyle}>
              Admin panel
            </Link>
            <button
              style={{ ...menuItemStyle, width: "100%", textAlign: "left", background: "none", border: "none", color: "var(--crimson)" }}
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 14px",
  fontSize: 13,
  color: "var(--text)",
};
