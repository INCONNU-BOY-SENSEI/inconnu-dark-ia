import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: "80px 60px", maxWidth: 780 }}>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14, fontFamily: "var(--font-display)" }}>
        BY INCONNU BOY SENSEI
      </div>
      <h1
        className="inconnu-glow-text"
        style={{ fontFamily: "var(--font-display)", fontSize: 48, lineHeight: 1.1, margin: 0 }}
      >
        INCONNU DARK IA
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: 16, marginTop: 20, maxWidth: 520, lineHeight: 1.6 }}>
        Your own AI, running locally on Ollama with Qwen. Chat with it, tune it in
        Settings, and drop an API key into any of your own projects to bring it with you.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <Link
          href="/signup"
          style={{
            padding: "11px 20px",
            borderRadius: 8,
            background: "var(--violet)",
            color: "#05050a",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Create account
        </Link>
        <Link
          href="/login"
          style={{
            padding: "11px 20px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            fontSize: 14,
          }}
        >
          Log in
        </Link>
      </div>

      <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { title: "Owner IA", desc: "Qwen model served through your own Ollama instance." },
          { title: "API keys", desc: "Bring INCONNU DARK IA into any project you build." },
          { title: "Full control", desc: "Model, temperature and system prompt, all yours to tune." },
        ].map((f) => (
          <div key={f.title} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 18, background: "var(--panel)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, marginBottom: 8, color: "var(--violet)" }}>
              {f.title}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
