import type { Metadata } from "next";
import "./globals.css";
import { InconnuSidebar } from "@/components/InconnuSidebar";

export const metadata: Metadata = {
  title: "INCONNU DARK IA",
  description: "AI platform by INCONNU BOY SENSEI, powered by Ollama + Qwen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="inconnu-scan">
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <InconnuSidebar />
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
