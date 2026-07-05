"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CrossSkillPage() {
  const [insight, setInsight] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function analyze() {
    setLoading(true);
    setError(null);
    fetch("/api/cross-skill")
      .then((r) => {
        if (!r.ok) throw new Error("Gagal mengambil insight");
        return r.json();
      })
      .then((d) => {
        setInsight(d.insight);
        setGeneratedAt(d.generatedAt);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message ?? "Terjadi kesalahan");
        setLoading(false);
      });
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #6</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Cross-Skill Insight</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            AI menganalisis korelasi antar track kamu — insight yang tidak terlihat jika melihat satu track saja.
          </p>
        </div>

        <Button onClick={analyze} disabled={loading}>
          {loading ? "Menganalisis..." : "Analisis Sekarang"}
        </Button>

        {error && (
          <Card className="border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}

        {insight && (
          <Card className="animate-in card-elevated">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{insight}</p>
            {generatedAt && (
              <p className="text-xs text-[var(--strophe-text-faint)] mt-3">
                Dibuat pada: {new Date(generatedAt).toLocaleString("id-ID")}
              </p>
            )}
          </Card>
        )}

        <p className="text-xs text-[var(--strophe-text-faint)]">
          Insight dibuat ulang setiap kali kamu klik tombol — progres terbaru selalu dipakai.
        </p>
      </div>
    </AppShell>
  );
}
