/**
 * Thin OpenRouter client. OpenRouter exposes an OpenAI-compatible
 * /chat/completions endpoint in front of many models (including Claude),
 * so no vendor SDK is needed — just fetch.
 *
 * Model is configurable via OPENROUTER_MODEL so switching models later
 * (or per-feature) never requires a code change.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

function requireApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Get a key at https://openrouter.ai/keys and add it to .env.local."
    );
  }
  return key;
}

function headers(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    // OpenRouter uses these purely for their own analytics/rankings — safe to set generically.
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://strophe.app",
    "X-Title": "STROPHE",
  };
}

/** One-shot, non-streaming completion. Use for short structured outputs (scoring, JSON, etc). */
export async function chatCompletion(
  messages: ChatMessage[],
  opts: ChatOptions = {}
): Promise<string> {
  const apiKey = requireApiKey();

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      messages,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens ?? 900,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenRouter request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenRouter returned an unexpected response shape.");
  }
  return content;
}

/**
 * Streaming completion for chat UIs (Investor Coach, Global Mentor, etc).
 * Returns a plain UTF-8 text stream of just the token deltas — the caller
 * can pipe this straight into a Next.js Route Handler `Response`.
 */
export async function streamChatCompletion(
  messages: ChatMessage[],
  opts: ChatOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = requireApiKey();

  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      messages,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens ?? 900,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    throw new Error(`OpenRouter stream request failed (${upstream.status}): ${errText}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta.length > 0) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // Ignore malformed SSE chunks (e.g. keep-alive comments) rather than
              // killing the whole stream over one bad line.
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
