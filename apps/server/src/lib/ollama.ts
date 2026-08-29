const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama:11434";

export interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function inconnuOllamaChat(
  model: string,
  messages: OllamaChatMessage[],
  temperature: number,
  onToken: (token: string) => void
): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: { temperature },
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama request failed: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line);
      const token = parsed?.message?.content;
      if (token) {
        full += token;
        onToken(token);
      }
    }
  }

  return full;
}
