"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Simulation {
  id: string;
  basedOnLevel: number;
  narrativeText: string;
  createdAt: string;
}

export default function FutureSelfPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/future-self")
      .then((r) => r.json())
      .then((d) => setSimulations(d.simulations ?? []))
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleGenerate() {
    setLoading(true);
    try {
      await fetch("/api/future-self", { method: "POST" });
      load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #25</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Future Self Simulator</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Simulasi motivasi berdasarkan pola progres kamu — bukan ramalan atau prediksi.
          </p>
        </div>

        <Card className="border-[var(--strophe-gold)]/40 bg-[var(--strophe-gold)]/5">
          <p className="text-sm text-[var(--strophe-gold-bright)]">
            Ini simulasi motivasi berdasarkan pola progres, bukan ramalan atau prediksi.
          </p>
        </Card>

        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Mensimulasikan..." : "Generate Simulasi Baru"}
        </Button>

        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--strophe-text-muted)]">
            Riwayat Simulasi
          </h2>
          {simulations.length === 0 && (
            <p className="text-sm text-[var(--strophe-text-faint)]">Belum ada simulasi. Tekan tombol di atas untuk memulai.</p>
          )}
          {simulations.map((sim) => (
            <Card key={sim.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[var(--strophe-text-faint)]">
                  {new Date(sim.createdAt).toLocaleDateString("id-ID")}
                </span>
                <span className="text-xs bg-[var(--strophe-gold)]/15 text-[var(--strophe-gold-bright)] rounded px-2 py-0.5">
                  Level {sim.basedOnLevel}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{sim.narrativeText}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
