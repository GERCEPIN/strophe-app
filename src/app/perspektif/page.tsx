"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Textarea, Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PerspectiveEntry {
  id: string;
  weekOf: string;
  insightText: string;
  comparisonOldThinking: string | null;
  createdAt: string;
}

export default function PerspektifPage() {
  const [entries, setEntries] = useState<PerspectiveEntry[]>([]);
  const [insightText, setInsightText] = useState("");
  const [comparisonOldThinking, setComparisonOldThinking] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadEntries() {
    fetch("/api/world-perspective")
      .then((r) => r.json())
      .then((d) => {
        if (d.entries) setEntries(d.entries);
      })
      .catch(() => {});
  }

  useEffect(loadEntries, []);

  function submit() {
    if (insightText.trim().length < 10) {
      setError("Insight minimal 10 karakter.");
      return;
    }
    setSubmitting(true);
    setError(null);
    fetch("/api/world-perspective", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        insightText: insightText.trim(),
        comparisonOldThinking: comparisonOldThinking.trim() || undefined,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setInsightText("");
          setComparisonOldThinking("");
          loadEntries();
        }
        setSubmitting(false);
      })
      .catch(() => {
        setError("Terjadi kesalahan. Coba lagi.");
        setSubmitting(false);
      });
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #21</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Perspektif Dunia</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Catat wawasan baru tentang dunia — dan bagaimana cara berpikirmu berubah dari sebelumnya.
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="insight">Insight atau perspektif baru minggu ini</Label>
              <Textarea
                id="insight"
                value={insightText}
                onChange={(e) => setInsightText(e.target.value)}
                placeholder="Apa yang kamu pelajari atau sadari minggu ini tentang dunia, orang lain, atau diri sendiri?"
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comparison">Dulu aku pikir... sekarang aku tahu... (opsional)</Label>
              <Textarea
                id="comparison"
                value={comparisonOldThinking}
                onChange={(e) => setComparisonOldThinking(e.target.value)}
                placeholder="Contoh: Dulu aku pikir keberhasilan = kerja keras saja. Sekarang aku tahu konteks dan timing juga sangat penting."
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button onClick={submit} disabled={submitting || insightText.trim().length < 10}>
              {submitting ? "Menyimpan..." : "Simpan Perspektif"}
            </Button>
          </div>
        </Card>

        <section className="space-y-4">
          <h2 className="text-base font-semibold">Riwayat Perspektif</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-[var(--strophe-text-muted)]">Belum ada entri. Mulai catat perspektif pertamamu!</p>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id}>
                <p className="text-xs text-[var(--strophe-text-faint)] mb-2">
                  Minggu {new Date(entry.weekOf + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-sm leading-relaxed">{entry.insightText}</p>
                {entry.comparisonOldThinking && (
                  <p className="text-sm text-[var(--strophe-text-muted)] mt-2 italic border-l-2 border-[var(--strophe-gold-dim)] pl-3">
                    {entry.comparisonOldThinking}
                  </p>
                )}
              </Card>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}
