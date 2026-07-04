"use client";

import { useEffect, useState, FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Input, Textarea, Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ReflectionEntry {
  id: string;
  track: string;
  level: number;
  question: string;
  answerText: string;
  createdAt: string;
}

export default function ReflectionPage() {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [level, setLevel] = useState(10);
  const [track, setTrack] = useState("core");
  const [question, setQuestion] = useState("Apa yang paling kamu pelajari dari level-level terakhir?");
  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/reflection")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, level, question, answerText }),
      });
      setAnswerText("");
      load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #24</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Reflection Level</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Refleksi wajib setiap kelipatan 10 level — tulis jujur, bukan untuk dilihat orang lain.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min={1}
                  value={level}
                  onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="track">Track</Label>
                <Input
                  id="track"
                  type="text"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="question">Pertanyaan refleksi</Label>
              <Input
                id="question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="answer">Jawaban refleksi kamu</Label>
              <Textarea
                id="answer"
                rows={5}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Tulis dengan jujur — ini catatanmu sendiri."
                required
                minLength={10}
              />
            </div>
            <Button type="submit" disabled={loading || answerText.trim().length < 10}>
              {loading ? "Menyimpan..." : "Simpan Refleksi"}
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--strophe-text-muted)]">
            Riwayat Refleksi
          </h2>
          {entries.length === 0 && (
            <p className="text-sm text-[var(--strophe-text-faint)]">Belum ada refleksi tersimpan.</p>
          )}
          {entries.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[var(--strophe-text-faint)]">
                  {new Date(entry.createdAt).toLocaleDateString("id-ID")}
                </span>
                <span className="text-xs bg-[var(--strophe-gold)]/15 text-[var(--strophe-gold-bright)] rounded px-2 py-0.5">
                  Level {entry.level}
                </span>
                <span className="text-xs text-[var(--strophe-text-muted)] capitalize">{entry.track}</span>
              </div>
              <p className="text-xs text-[var(--strophe-text-muted)] italic mb-1">{entry.question}</p>
              <p className="text-sm leading-relaxed">{entry.answerText}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
