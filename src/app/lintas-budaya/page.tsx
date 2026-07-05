"use client";

import { useState, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CULTURAL_CONTEXTS, type CulturalContextId } from "@/lib/ai/prompts/crossCulturalScenario";

interface ScenarioOption {
  id: string;
  label: string;
}

interface ScenarioData {
  scenarioId: string;
  level: number;
  scenario: string;
  options: ScenarioOption[];
  culturalContext: string;
}

interface SubmitResult {
  correct: boolean;
  correctOptionId: string;
  reasoning: string;
  decisionMs: number;
}

export default function LintasBudayaPage() {
  const [selectedCulture, setSelectedCulture] = useState<CulturalContextId | "">("");
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startMsRef = useRef<number>(0);

  function handleCultureSelect(id: CulturalContextId) {
    setSelectedCulture(id);
    setScenario(null);
    setResult(null);
    setError(null);
  }

  function generateScenario() {
    if (!selectedCulture) return;
    setLoading(true);
    setError(null);
    setScenario(null);
    setResult(null);

    fetch("/api/lintas-budaya/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ culturalContextId: selectedCulture }),
    })
      .then((r) => r.json())
      .then((data: ScenarioData & { error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          setScenario(data);
          startMsRef.current = Date.now();
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Tidak bisa terhubung ke server.");
        setLoading(false);
      });
  }

  function handleChoose(optionId: string) {
    if (!scenario || submitting || result) return;
    // eslint-disable-next-line react-hooks/purity
    const decisionMs = Date.now() - startMsRef.current;
    setSubmitting(true);

    fetch("/api/insting/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: scenario.scenarioId, chosenOptionId: optionId, decisionMs }),
    })
      .then((r) => r.json())
      .then((data: SubmitResult & { error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          setResult(data);
        }
        setSubmitting(false);
      })
      .catch(() => {
        setError("Gagal mengirim jawaban.");
        setSubmitting(false);
      });
  }

  function reset() {
    setScenario(null);
    setResult(null);
    setError(null);
  }

  const selectedLabel = CULTURAL_CONTEXTS.find((c) => c.id === selectedCulture)?.label ?? "";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #20</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Skenario Lintas Budaya</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Latih intuisi dalam konteks budaya yang berbeda — pilihan yang tepat bisa berbeda dari kebiasaanmu.
          </p>
        </div>

        {/* Culture selector */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--strophe-text-muted)] mb-3">Pilih Konteks Budaya</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CULTURAL_CONTEXTS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCultureSelect(c.id)}
                className={[
                  "text-left px-4 py-3 rounded-lg border text-sm transition-colors",
                  selectedCulture === c.id
                    ? "border-[var(--strophe-gold)] bg-[var(--strophe-gold)]/10 text-[var(--strophe-gold-bright)]"
                    : "border-[var(--strophe-border)] hover:border-[var(--strophe-gold)]/50",
                ].join(" ")}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {selectedCulture && !scenario && !loading && (
          <Button onClick={generateScenario}>Mulai Skenario</Button>
        )}

        {loading && (
          <p className="text-sm text-[var(--strophe-text-muted)]">Membuat skenario…</p>
        )}

        {error && (
          <Card className="border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}

        {scenario && !result && (
          <Card className="animate-in card-elevated">
            <p className="text-xs uppercase tracking-widest text-[var(--strophe-text-muted)] mb-1">
              Konteks: {selectedLabel.split("—")[0].trim()}
            </p>
            <p className="text-sm leading-relaxed mb-5">{scenario.scenario}</p>
            <div className="space-y-2">
              {scenario.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleChoose(opt.id)}
                  disabled={submitting}
                  className="w-full text-left px-4 py-3 rounded-lg border border-[var(--strophe-border)] hover:border-[var(--strophe-gold)]/60 text-sm transition-colors disabled:opacity-50"
                >
                  <span className="font-medium uppercase mr-2 text-[var(--strophe-gold)]">{opt.id}.</span>
                  {opt.label}
                </button>
              ))}
            </div>
            {submitting && <p className="text-xs text-[var(--strophe-text-muted)] mt-3">Mengevaluasi…</p>}
          </Card>
        )}

        {scenario && result && (
          <Card className={`animate-in card-elevated ${result.correct ? "border-[var(--strophe-success)]/40" : "border-red-500/30"}`}>
            <p className={`text-sm font-semibold mb-2 ${result.correct ? "text-[var(--strophe-success)]" : "text-red-400"}`}>
              {result.correct ? "Tepat! Kamu memahami konteks budayanya." : "Kurang tepat untuk konteks budaya ini."}
            </p>
            <p className="text-xs text-[var(--strophe-text-muted)] mb-1">
              Waktu keputusan: {(result.decisionMs / 1000).toFixed(1)}s
            </p>
            <p className="text-sm leading-relaxed mt-3 border-t border-[var(--strophe-border)] pt-3">
              {result.reasoning}
            </p>
            <div className="flex gap-2 mt-4">
              <Button onClick={generateScenario}>Skenario Berikutnya</Button>
              <Button variant="ghost" onClick={reset}>Ganti Budaya</Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
