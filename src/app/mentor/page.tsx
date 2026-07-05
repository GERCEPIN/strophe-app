"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Textarea } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type PersonaKey =
  | "netral"
  | "disiplin_jepang"
  | "keberanian_barat"
  | "ketekunan_jerman"
  | "harmoni_nordik"
  | "ketegasan_korea"
  | "diamond_tegas";

const PERSONA_LABELS: Record<PersonaKey, string> = {
  netral: "Netral",
  disiplin_jepang: "Disiplin (Jepang)",
  keberanian_barat: "Keberanian (Barat)",
  ketekunan_jerman: "Ketekunan (Jerman)",
  harmoni_nordik: "Harmoni (Nordik)",
  ketegasan_korea: "Ketegasan (Korea)",
  diamond_tegas: "Tegas (Diamond)",
};

const BASE_PERSONAS: PersonaKey[] = [
  "netral",
  "disiplin_jepang",
  "keberanian_barat",
  "ketekunan_jerman",
  "harmoni_nordik",
  "ketegasan_korea",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MentorPage() {
  const [history, setHistory] = useState<Message[]>([]);
  const [persona, setPersona] = useState<PersonaKey>("netral");
  const [hasDiamondUnlock, setHasDiamondUnlock] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  function loadHistory() {
    fetch("/api/mentor")
      .then((r) => r.json())
      .then((d) => {
        if (d.history) setHistory(d.history);
        if (d.currentPersona) setPersona(d.currentPersona as PersonaKey);
        if (d.hasDiamondUnlock) setHasDiamondUnlock(true);
      })
      .catch(() => {});
  }

  useEffect(loadHistory, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, streamingText]);

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || streaming) return;
    setInput("");
    setStreaming(true);
    setStreamingText("");

    const optimisticHistory = [...history, { role: "user" as const, content: msg }];
    setHistory(optimisticHistory);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, persona }),
      });

      if (!res.ok || !res.body) {
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingText(accumulated);
      }

      setHistory([...optimisticHistory, { role: "assistant", content: accumulated }]);
      setStreamingText("");
    } catch {
      // ignore
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4 flex flex-col h-[calc(100vh-140px)]">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #18</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Global Mentor</h1>
        </div>

        {/* Persona selector */}
        <Card className="card-elevated animate-in stagger-1">
          <p className="text-xs text-[var(--strophe-text-muted)] mb-2 font-medium uppercase tracking-wider">
            Pilih Gaya Mentor
          </p>
          <div className="flex flex-wrap gap-2">
            {BASE_PERSONAS.map((p) => (
              <button
                key={p}
                onClick={() => setPersona(p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  persona === p
                    ? "bg-[var(--strophe-gold)]/15 border-[var(--strophe-gold)] text-[var(--strophe-gold-bright)]"
                    : "border-[var(--strophe-border)] text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]"
                }`}
              >
                {PERSONA_LABELS[p]}
              </button>
            ))}
            {/* Diamond Mentor — unlocked after first Diamond Checkpoint */}
            {hasDiamondUnlock ? (
              <button
                onClick={() => setPersona("diamond_tegas")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  persona === "diamond_tegas"
                    ? "bg-[var(--strophe-diamond)]/20 border-[var(--strophe-diamond)] text-[var(--strophe-diamond)]"
                    : "border-[var(--strophe-diamond)]/40 text-[var(--strophe-diamond)] hover:border-[var(--strophe-diamond)]"
                }`}
              >
                Tegas (Diamond) ◆
              </button>
            ) : (
              <span
                title="Selesaikan Diamond Checkpoint pertama (level 50) untuk membuka persona ini."
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--strophe-border)] text-[var(--strophe-text-faint)] cursor-not-allowed select-none"
              >
                Tegas (Diamond) ◆ Terkunci
              </span>
            )}
          </div>
        </Card>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {history.length === 0 && !streaming && (
            <p className="text-sm text-[var(--strophe-text-muted)] text-center py-8">
              Mulai percakapan dengan mentormu. Pilih gaya mentor di atas, lalu kirim pesan pertamamu.
            </p>
          )}
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[var(--strophe-gold)]/15 text-[var(--strophe-text)]"
                    : "bg-[var(--strophe-surface)] border border-[var(--strophe-border)]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {streaming && streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2.5 text-sm bg-[var(--strophe-surface)] border border-[var(--strophe-border)] whitespace-pre-wrap">
                {streamingText}
                <span className="inline-block w-1 h-3 bg-[var(--strophe-gold)] ml-0.5 animate-pulse" />
              </div>
            </div>
          )}
          {streaming && !streamingText && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2.5 text-sm bg-[var(--strophe-surface)] border border-[var(--strophe-border)] text-[var(--strophe-text-muted)]">
                Mentor sedang mengetik...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesanmu... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            rows={2}
            disabled={streaming}
            className="flex-1 resize-none"
          />
          <Button onClick={sendMessage} disabled={streaming || !input.trim()}>
            {streaming ? "..." : "Kirim"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
