"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DueItem {
  itemId: string;
  term: string;
  prompt: string;
  answer: string;
  explanation: string;
}

const GRADE_OPTIONS = [
  { grade: 1, label: "Lupa total" },
  { grade: 3, label: "Ingat, tapi susah" },
  { grade: 5, label: "Ingat dengan mudah" },
];

export default function MemoryVaultPage() {
  const [due, setDue] = useState<DueItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/memory-vault/due")
      .then((r) => r.json())
      .then((d) => setDue(d.due))
      .catch(() => setDue([]));
  }, []);

  async function grade(g: number) {
    if (!due) return;
    const current = due[index];
    setSubmitting(true);
    try {
      await fetch("/api/memory-vault/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: current.itemId, grade: g }),
      });
      setRevealed(false);
      setIndex((i) => i + 1);
    } finally {
      setSubmitting(false);
    }
  }

  if (due === null) {
    return (
      <AppShell>
        <p className="text-[var(--strophe-text-muted)]">Memuat...</p>
      </AppShell>
    );
  }

  const current = due[index];

  return (
    <AppShell>
      <div className="max-w-xl mx-auto space-y-5">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Memory Vault</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Daya Ingat</h1>
        </div>

        {!current && (
          <Card>
            <p className="text-sm text-[var(--strophe-text-muted)]">
              Tidak ada materi yang jatuh tempo untuk direview hari ini. Kembali lagi besok, atau naikkan level di
              Sesi Inti untuk membuka materi baru.
            </p>
          </Card>
        )}

        {current && (
          <Card className="card-elevated animate-in stagger-1">
            <p className="text-xs text-[var(--strophe-gold)] uppercase tracking-wider mb-2">{current.term}</p>
            <p className="text-sm mb-5">{current.prompt}</p>

            {!revealed && (
              <Button variant="secondary" onClick={() => setRevealed(true)}>
                Tampilkan Jawaban
              </Button>
            )}

            {revealed && (
              <div className="space-y-4">
                <div className="rounded-md bg-[var(--strophe-bg-elevated)] p-3.5 text-sm">
                  <p className="font-medium mb-1">Jawaban:</p>
                  <p className="text-[var(--strophe-text-muted)] mb-3">{current.answer}</p>
                  <p className="font-medium mb-1">Analogi:</p>
                  <p className="text-[var(--strophe-text-muted)]">{current.explanation}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--strophe-text-muted)] mb-2">Seberapa ingat kamu tadi?</p>
                  <div className="flex gap-2">
                    {GRADE_OPTIONS.map((g) => (
                      <Button key={g.grade} variant="secondary" disabled={submitting} onClick={() => grade(g.grade)}>
                        {g.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {due.length > 0 && (
          <p className="text-xs text-[var(--strophe-text-faint)]">
            {Math.min(index + 1, due.length)} dari {due.length} materi hari ini
          </p>
        )}
      </div>
    </AppShell>
  );
}
