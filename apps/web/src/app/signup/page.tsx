"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InconnuAuthCard, inconnuInputStyle, inconnuButtonStyle } from "@/components/InconnuAuthCard";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Signup failed");
      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <InconnuAuthCard title="Create account">
      <form onSubmit={handleSubmit}>
        <input
          style={inconnuInputStyle}
          type="text"
          placeholder="Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
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
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        {error && <div style={{ color: "var(--crimson)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
        <button style={inconnuButtonStyle} type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-dim)" }}>
        Already have an account? <Link href="/login" style={{ color: "var(--violet)" }}>Log in</Link>
      </div>
    </InconnuAuthCard>
  );
}
