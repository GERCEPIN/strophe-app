"use client";

import { useEffect, useState, FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Textarea, Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Entry {
  id: string;
  date: string;
  decisionText: string;
  aiPatternNote: string | null;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [decisionText, setDecisionText] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionText, context }),
      });
      setDecisionText("");
      setContext("");
      load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #22</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Decision Journal Otomatis</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Catat satu keputusan penting hari ini. AI akan mencari pola dari waktu ke waktu — hanya dari data yang
            kamu tulis sendiri.
          </p>
        </div>

        <Card className="card-elevated animate-in stagger-1">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="decision">Keputusan hari ini</Label>
              <Textarea id="decision" rows={3} value={decisionText} onChange={(e) => setDecisionText(e.target.value)} required minLength={3} />
            </div>
            <div>
              <Label htmlFor="context">Konteks tambahan (opsional)</Label>
              <Textarea id="context" rows={2} value={context} onChange={(e) => setContext(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading || decisionText.trim().length < 3}>
              {loading ? "Menyimpan & menganalisis..." : "Simpan Keputusan"}
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="card-elevated transition-colors duration-150 hover:bg-[var(--strophe-surface-hover)]">
              <p className="text-xs text-[var(--strophe-text-faint)] mb-1">{entry.date}</p>
              <p className="text-sm mb-2">{entry.decisionText}</p>
              {entry.aiPatternNote && (
                <p className="text-sm text-[var(--strophe-gold-bright)] border-t border-[var(--strophe-border)] pt-2 mt-2">
                  {entry.aiPatternNote}
                </p>
              )}
            </Card>
          ))}
          {entries.length === 0 && <p className="text-sm text-[var(--strophe-text-faint)]">Belum ada entri jurnal.</p>}
        </div>
      </div>
    </AppShell>
  );
}
