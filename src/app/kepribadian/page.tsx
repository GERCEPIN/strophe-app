"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface MaturityReport {
  id: string;
  monthOf: string;
  reportText: string;
  entriesAnalyzed: number;
  createdAt: string;
}

export default function KepribadianPage() {
  const [reports, setReports] = useState<MaturityReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadReports() {
    fetch("/api/personality-maturity")
      .then((r) => r.json())
      .then((d) => {
        if (d.reports) setReports(d.reports);
      })
      .catch(() => {});
  }

  useEffect(loadReports, []);

  function generateReport() {
    setGenerating(true);
    setMessage(null);
    setError(null);
    fetch("/api/personality-maturity", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else if (d.alreadyExists) {
          setMessage("Laporan bulan ini sudah ada.");
        } else {
          setMessage("Laporan bulan ini berhasil dibuat.");
        }
        loadReports();
        setGenerating(false);
      })
      .catch(() => {
        setError("Terjadi kesalahan. Coba lagi.");
        setGenerating(false);
      });
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #28</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Kematangan Kepribadian</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Analisis bulanan pola pengambilan keputusanmu dari jurnal — lebih bermakna setelah 1+ bulan data terkumpul.
          </p>
        </div>

        <Button onClick={generateReport} disabled={generating}>
          {generating ? "Membuat laporan..." : "Generate Laporan Bulan Ini"}
        </Button>

        {message && (
          <Card className="border-[var(--strophe-success)]/30">
            <p className="text-sm text-[var(--strophe-success)]">{message}</p>
          </Card>
        )}

        {error && (
          <Card className="border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}

        <section className="space-y-4">
          <h2 className="text-base font-semibold">Riwayat Laporan</h2>
          {reports.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--strophe-text-muted)]">
                Belum ada laporan. Klik tombol di atas untuk membuat laporan bulan ini.
                Pastikan sudah mengisi setidaknya beberapa entri jurnal agar analisis bermakna.
              </p>
            </Card>
          ) : (
            reports.map((r) => (
              <Card key={r.id} className="card-elevated transition-colors duration-150 hover:bg-[var(--strophe-surface-hover)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {new Date(r.monthOf + "T00:00:00").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                    </p>
                    <span className="text-xs text-[var(--strophe-text-faint)]">
                      {r.entriesAnalyzed} entri dianalisis
                    </span>
                  </div>
                  <p className="text-sm text-[var(--strophe-text-muted)] leading-relaxed whitespace-pre-wrap">
                    {r.reportText}
                  </p>
                </div>
              </Card>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}
