"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Suggestion {
  id: string;
  suggestedSkill: string;
  reason: string;
  accepted: boolean | null;
  createdAt: string;
}

export default function SkillRadarPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/skill-radar")
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions ?? []))
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleAnalyze() {
    setLoading(true);
    try {
      await fetch("/api/skill-radar", { method: "POST" });
      load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #14</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Skill Radar</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            AI menganalisis progres semua track dan merekomendasikan fokus berikutnya.
          </p>
        </div>

        <Card className="border-[var(--strophe-border)]">
          <p className="text-xs text-[var(--strophe-text-muted)]">
            Rekomendasi ini berdasarkan perbandingan progres antar track kamu, bukan standar eksternal.
          </p>
        </Card>

        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Menganalisis..." : "Analisis Skill Saya"}
        </Button>

        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--strophe-text-muted)]">
            Riwayat Rekomendasi
          </h2>
          {suggestions.length === 0 && (
            <p className="text-sm text-[var(--strophe-text-faint)]">
              Belum ada rekomendasi. Tekan tombol di atas untuk analisis pertama.
            </p>
          )}
          {suggestions.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[var(--strophe-text-faint)]">
                  {new Date(s.createdAt).toLocaleDateString("id-ID")}
                </span>
                {s.accepted === true && (
                  <span className="text-xs bg-green-500/20 text-green-400 rounded px-2 py-0.5">Diterima</span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{s.reason}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
