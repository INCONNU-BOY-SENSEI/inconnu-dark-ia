"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InconnuAuthCard, inconnuInputStyle, inconnuButtonStyle } from "@/components/InconnuAuthCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <InconnuAuthCard title="Log in">
      <form onSubmit={handleSubmit}>
        <input
          style={inconnuInputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={inconnuInputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={{ color: "var(--crimson)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <button style={inconnuButtonStyle} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-dim)" }}>
        No account? <Link href="/signup" style={{ color: "var(--violet)" }}>Sign up</Link>
      </div>
    </InconnuAuthCard>
  );
}
