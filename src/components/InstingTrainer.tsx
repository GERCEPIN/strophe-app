"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Scenario {
  scenarioId: string;
  scenario: string;
  options: { id: string; label: string }[];
  isReverseLevel: boolean;
}

interface Result {
  correct: boolean;
  reasoning: string;
  decisionMs: number;
}

export function InstingTrainer() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  async function loadScenario(wantReverseLevel = false) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/insting/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wantReverseLevel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memuat skenario.");
        return;
      }
      setScenario(data);
      setStartedAt(Date.now());
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  async function choose(optionId: string) {
    if (!scenario || !startedAt) return;
    // Date.now() here runs inside a user-triggered event handler (never during
    // render), which is the standard safe place for impure timestamp reads —
    // only render-time impurity is unsafe.
    // eslint-disable-next-line react-hooks/purity
    const decisionMs = Date.now() - startedAt;
    setLoading(true);
    try {
      const res = await fetch("/api/insting/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.scenarioId, chosenOptionId: optionId, decisionMs }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-[family-name:var(--font-display)] font-semibold">AI Insting Trainer</h3>
        {scenario?.isReverseLevel && (
          <span className="text-[10px] uppercase tracking-wider bg-[var(--strophe-danger-dim)] text-[var(--strophe-text)] px-2 py-1 rounded">
            Reverse Level — Uji Nyali
          </span>
        )}
      </div>

      {!scenario && !loading && (
        <div className="flex gap-2">
          <Button onClick={() => loadScenario(false)}>Mulai Skenario</Button>
          <Button variant="secondary" onClick={() => loadScenario(true)}>
            Uji Nyali (Reverse Level)
          </Button>
        </div>
      )}

      {loading && !scenario && <p className="text-sm text-[var(--strophe-text-muted)]">Membuat skenario...</p>}
      {error && <p className="text-sm text-[var(--strophe-danger)]">{error}</p>}

      {scenario && !result && (
        <div>
          <p className="text-sm mb-4">{scenario.scenario}</p>
          <div className="flex flex-col gap-2">
            {scenario.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => choose(opt.id)}
                disabled={loading}
                className="text-left rounded-md border border-[var(--strophe-border-strong)] px-3.5 py-2.5 text-sm hover:border-[var(--strophe-gold)] hover:bg-[var(--strophe-surface-hover)] transition-colors disabled:opacity-50"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <p className={`text-sm font-medium ${result.correct ? "text-[var(--strophe-success)]" : "text-[var(--strophe-danger)]"}`}>
            {result.correct ? "Tepat." : "Belum tepat."} Waktu putuskan: {(result.decisionMs / 1000).toFixed(1)}s
          </p>
          <p className="text-sm text-[var(--strophe-text-muted)]">{result.reasoning}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setScenario(null);
              setResult(null);
            }}
          >
            Skenario Lain
          </Button>
        </div>
      )}
    </Card>
  );
}
