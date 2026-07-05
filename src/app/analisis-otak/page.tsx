"use client";

import { useRef, useState, ChangeEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Region {
  id: string;
  name: string;
  description: string;
  activation: number;
}

interface AnalysisResult {
  regions: Region[];
  dominant: string;
}

const REGION_COLORS: Record<string, string> = {
  prefrontal:  "var(--strophe-gold)",
  frontal:     "#a78bfa",
  temporal:    "#34d399",
  parietal:    "#60a5fa",
  occipital:   "#f472b6",
  limbic:      "#fb923c",
  right_front: "#818cf8",
  cerebellum:  "#94a3b8",
};

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res((reader.result as string).split(",")[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

export default function AnalisisOtakPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setImageB64(await toBase64(file));
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!imageB64) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/brain-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: imageB64, text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Analisis gagal."); return; }
      setResult(data);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">TRIBE v2 · Facebook Research</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Analisis Otak</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1 leading-relaxed">
            Upload gambar — model TRIBE v2 memprediksi respons tiap region korteks terhadap stimulus visual kamu.
          </p>
        </div>

        <Card className="card-elevated animate-in stagger-1 space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--strophe-border-strong)] hover:border-[var(--strophe-gold-dim)] transition-colors cursor-pointer min-h-[180px] overflow-hidden"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="max-h-48 object-contain rounded-md" />
            ) : (
              <>
                <span className="text-3xl">🧠</span>
                <p className="text-sm text-[var(--strophe-text-muted)]">Klik untuk upload gambar</p>
                <p className="text-xs text-[var(--strophe-text-faint)]">JPG, PNG, WebP · maks 2 MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>

          <div>
            <label className="text-xs text-[var(--strophe-text-muted)] block mb-1">
              Konteks teks (opsional) — apa yang kamu pikirkan saat melihat gambar ini?
            </label>
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="mis. Saya melihat pantai dan merasakan ketenangan..."
              className="w-full rounded-md border border-[var(--strophe-border-strong)] bg-[var(--strophe-bg-elevated)] px-3.5 py-2.5 text-sm resize-none hover:border-[var(--strophe-gold-dim)] focus:border-[var(--strophe-gold)] outline-none transition-colors duration-150"
            />
          </div>

          {error && <p className="text-sm text-[var(--strophe-danger)]">{error}</p>}

          <Button onClick={handleAnalyze} disabled={!imageB64 || loading}>
            {loading ? "Menganalisis otak... (1–2 menit)" : "Analisis Sekarang"}
          </Button>

          {loading && (
            <p className="text-xs text-[var(--strophe-text-faint)] leading-relaxed">
              Model TRIBE v2 sedang memproses stimulus visual pada ~20.000 titik korteks.
              Proses ini memakan waktu 1–2 menit saat pertama kali (cold start GPU).
            </p>
          )}
        </Card>

        {result && (
          <div className="space-y-4 animate-in">
            <Card className="card-elevated">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)] mb-1">Hasil Analisis</p>
              <p className="text-sm text-[var(--strophe-text-muted)] mb-4">
                Region paling aktif:{" "}
                <span className="text-[var(--strophe-text)] font-medium">{result.dominant}</span>
              </p>

              <div className="space-y-3">
                {result.regions.map((r) => {
                  const pct = Math.round(r.activation * 100);
                  const color = REGION_COLORS[r.id] ?? "var(--strophe-gold)";
                  return (
                    <div key={r.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium">{r.name}</span>
                        <span className="text-xs tabular-nums" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--strophe-bg-elevated)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <p className="text-xs text-[var(--strophe-text-faint)] mt-0.5">{r.description}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <p className="text-xs text-[var(--strophe-text-faint)] leading-relaxed">
              Prediksi dihasilkan oleh TRIBE v2 (Facebook Research) — model enkoding otak multimodal yang
              dilatih pada data fMRI naturalistik. Hasil ini bersifat estimasi untuk rata-rata populasi,
              bukan diagnosis medis individual.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
