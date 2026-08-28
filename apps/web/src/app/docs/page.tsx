export default function DocsPage() {
  return (
    <div style={{ padding: "40px 48px", maxWidth: 720 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22 }} className="inconnu-glow-text">
        Docs
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 8 }}>
        Bring INCONNU DARK IA into any project using an API key from Settings.
      </p>

      <h2 style={sectionTitle}>Authentication</h2>
      <p style={pStyle}>Send your key as a bearer token on every request.</p>
      <pre style={codeBlock}>{`Authorization: Bearer idk-live-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</pre>

      <h2 style={sectionTitle}>Send a message</h2>
      <pre style={codeBlock}>{`POST /api/v1/chat
Content-Type: application/json
Authorization: Bearer <your-key>

{
  "message": "Hello, who are you?"
}`}</pre>

      <h2 style={sectionTitle}>Response</h2>
      <pre style={codeBlock}>{`{
  "reply": "I am INCONNU DARK IA, built by INCONNU BOY SENSEI."
}`}</pre>

      <h2 style={sectionTitle}>curl example</h2>
      <pre style={codeBlock}>{`curl -X POST https://your-domain.com/api/v1/chat \\
  -H "Authorization: Bearer idk-live-xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello"}'`}</pre>

      <h2 style={sectionTitle}>Notes</h2>
      <ul style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.8 }}>
        <li>The model, temperature and system prompt used are the ones set in your Settings page.</li>
        <li>Revoke a key any time from Settings — revoked keys stop working immediately.</li>
        <li>This endpoint is non-streaming; the chat page itself streams token by token.</li>
      </ul>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--violet)",
  marginTop: 32,
  fontFamily: "var(--font-display)",
};

const pStyle: React.CSSProperties = { fontSize: 13, color: "var(--text-dim)", marginTop: 6 };

const codeBlock: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: 16,
  fontSize: 12.5,
  overflowX: "auto",
  marginTop: 10,
};
