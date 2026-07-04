"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Textarea } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";

interface Lesson {
  id: string;
  title: string;
  analogy: string;
  contentMarkdown: string;
}

interface CaseStudy {
  id: string;
  scenarioText: string;
  guidingQuestions: string[];
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

function LessonPanel() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submittingCase, setSubmittingCase] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetch("/api/stock-academy/lesson?category=fundamental")
      .then((r) => r.json())
      .then((d) => {
        setLesson(d.lesson);
        setLevel(d.level);
        if (d.lesson) {
          fetch(`/api/stock-academy/case-study?lessonId=${d.lesson.id}`)
            .then((r) => r.json())
            .then((cd) => setCaseStudy(cd.caseStudy));
        }
      });
  }, []);

  async function submitCase() {
    if (!caseStudy) return;
    setSubmittingCase(true);
    try {
      const res = await fetch("/api/stock-academy/case-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseStudyId: caseStudy.id, userAnalysis: analysis }),
      });
      const data = await res.json();
      if (res.ok) setFeedback(data.attempt.coachFeedback);
    } finally {
      setSubmittingCase(false);
    }
  }

  async function completeLevel() {
    setCompleting(true);
    try {
      await fetch("/api/stock-academy/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "fundamental" }),
      });
      window.location.reload();
    } finally {
      setCompleting(false);
    }
  }

  if (!lesson) return <p className="text-sm text-[var(--strophe-text-muted)]">Memuat materi...</p>;

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs uppercase tracking-wider text-[var(--strophe-gold)] mb-1">Fundamental — Level {level}</p>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-2">{lesson.title}</h2>
        <p className="text-sm italic text-[var(--strophe-text-muted)] mb-4">{lesson.analogy}</p>
        <SimpleMarkdown text={lesson.contentMarkdown} />
        <Button className="mt-4" onClick={completeLevel} disabled={completing}>
          {completing ? "Menyimpan..." : "Tandai Level Selesai"}
        </Button>
      </Card>

      {caseStudy && (
        <Card>
          <h3 className="font-[family-name:var(--font-display)] font-semibold mb-2">Studi Kasus Ilustrasi</h3>
          <div className="text-sm whitespace-pre-line text-[var(--strophe-text-muted)] mb-3 bg-[var(--strophe-bg-elevated)] rounded-md p-3">
            {caseStudy.scenarioText}
          </div>
          <ul className="text-sm list-disc pl-5 mb-3 space-y-1">
            {caseStudy.guidingQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <Textarea
            rows={4}
            placeholder="Tulis analisismu di sini..."
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
          />
          <Button className="mt-3" onClick={submitCase} disabled={submittingCase || analysis.trim().length < 10}>
            {submittingCase ? "Coach sedang menilai..." : "Kirim ke Coach"}
          </Button>
          {feedback && (
            <div className="mt-3 text-sm border-t border-[var(--strophe-border)] pt-3 text-[var(--strophe-gold-bright)]">
              {feedback}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function CoachChatPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [disclaimer, setDisclaimer] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/investor/chat")
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.history ?? []);
        setDisclaimer(d.disclaimer ?? "");
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/investor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Maaf, Coach sedang tidak bisa dihubungi." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <Card className="flex flex-col h-[520px]">
      {disclaimer && (
        <p className="text-xs text-[var(--strophe-text-faint)] border-b border-[var(--strophe-border)] pb-3 mb-3">
          {disclaimer}
        </p>
      )}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--strophe-text-muted)]">
            Tanya apa saja soal cara membaca laporan keuangan, rasio valuasi, atau cara berpikir menganalisis saham.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm rounded-md px-3.5 py-2.5 max-w-[85%] ${
              m.role === "user"
                ? "bg-[var(--strophe-gold)]/15 ml-auto text-[var(--strophe-text)]"
                : "bg-[var(--strophe-bg-elevated)] text-[var(--strophe-text-muted)]"
            }`}
          >
            {m.content || "..."}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--strophe-border)]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Tulis pertanyaan..."
          className="flex-1 rounded-md border border-[var(--strophe-border-strong)] bg-[var(--strophe-bg-elevated)] px-3.5 py-2 text-sm outline-none focus:border-[var(--strophe-gold)]"
        />
        <Button onClick={send} disabled={streaming || !input.trim()}>
          Kirim
        </Button>
      </div>
    </Card>
  );
}

export default function AkademiSahamPage() {
  const [tab, setTab] = useState<"materi" | "coach">("materi");

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Modul Terpisah</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Akademi Analisis Saham</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab("materi")}
            className={`text-sm px-3.5 py-1.5 rounded-md ${tab === "materi" ? "bg-[var(--strophe-gold)]/15 text-[var(--strophe-gold-bright)]" : "text-[var(--strophe-text-muted)]"}`}
          >
            Materi
          </button>
          <button
            onClick={() => setTab("coach")}
            className={`text-sm px-3.5 py-1.5 rounded-md ${tab === "coach" ? "bg-[var(--strophe-gold)]/15 text-[var(--strophe-gold-bright)]" : "text-[var(--strophe-text-muted)]"}`}
          >
            Tanya Coach
          </button>
        </div>

        {tab === "materi" ? <LessonPanel /> : <CoachChatPanel />}
      </div>
    </AppShell>
  );
}
