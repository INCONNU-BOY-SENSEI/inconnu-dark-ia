"use client";

export function InconnuAuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <div
        style={{
          width: 380,
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 32,
          boxShadow: "var(--glow)",
        }}
      >
        <h1
          className="inconnu-glow-text"
          style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 24px" }}
        >
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}

export const inconnuInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "var(--panel-raised)",
  color: "var(--text)",
  fontSize: 13.5,
  marginBottom: 12,
};

export const inconnuButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 8,
  border: "none",
  background: "var(--violet)",
  color: "#05050a",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  marginTop: 4,
};
