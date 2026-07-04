"use client";

import { useEffect, useState, FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Input, Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DictionaryEntry {
  id: string;
  term: string;
  simplifiedExplanation: string;
  simplificationLevel: number;
}

export default function KamusPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [term, setTerm] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<{ term: string; explanation: string; simplificationLevel: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadEntries() {
    fetch("/api/dictionary/simplify")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {});
  }

  useEffect(loadEntries, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dictionary/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menjelaskan istilah.");
        return;
      }
      setResult(data);
      loadEntries();
    } finally {
      setLoading(false);
    }
  }

  async function explainAgainSimpler() {
    if (!result) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dictionary/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: result.term, context }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        loadEntries();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Auto-Simplifier</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Kamus Pribadi</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="term">Istilah yang belum kamu pahami</Label>
              <Input id="term" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="mis. moat, spaced repetition, DER" required />
            </div>
            <div>
              <Label htmlFor="context">Muncul di mana? (opsional)</Label>
              <Input id="context" value={context} onChange={(e) => setContext(e.target.value)} placeholder="mis. materi Akademi Saham level 5" />
            </div>
            <Button type="submit" disabled={loading || !term.trim()}>
              {loading ? "Menjelaskan..." : "Jelasin"}
            </Button>
          </form>

          {error && <p className="text-sm text-[var(--strophe-danger)] mt-3">{error}</p>}

          {result && (
            <div className="mt-4 rounded-md bg-[var(--strophe-bg-elevated)] p-3.5">
              <p className="text-sm font-medium text-[var(--strophe-gold-bright)] mb-1">{result.term}</p>
              <p className="text-sm text-[var(--strophe-text-muted)] mb-3">{result.explanation}</p>
              <Button variant="ghost" className="text-xs" onClick={explainAgainSimpler} disabled={loading}>
                Jelasin Lagi Lebih Gampang →
              </Button>
            </div>
          )}
        </Card>

        <div>
          <h2 className="text-sm font-medium text-[var(--strophe-text-muted)] mb-3">
            Istilah tersimpan ({entries.length})
          </h2>
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card key={entry.id} className="py-3">
                <p className="text-sm font-medium">{entry.term}</p>
                <p className="text-sm text-[var(--strophe-text-muted)] mt-1">{entry.simplifiedExplanation}</p>
              </Card>
            ))}
            {entries.length === 0 && <p className="text-sm text-[var(--strophe-text-faint)]">Belum ada istilah tersimpan.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
