"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Report {
  id: string;
  weekOf: string;
  weaknessesText: string;
  oneSmallStep: string;
  createdAt: string;
}

export default function BrutalHonestyPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  function load() {
    fetch("/api/brutal-honesty")
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []))
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleGenerate() {
    setAlreadyExists(false);
    setLoading(true);
    try {
      const res = await fetch("/api/brutal-honesty", { method: "POST" });
      const data = await res.json();
      if (data.alreadyExists) {
        setAlreadyExists(true);
      }
      load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #26</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Brutal Honesty Report</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Laporan jujur mingguan berdasarkan data progres kamu — bukan asumsi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Menganalisis..." : "Generate Laporan Minggu Ini"}
          </Button>
          {alreadyExists && (
            <p className="text-sm text-[var(--strophe-text-muted)]">Laporan minggu ini sudah ada.</p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--strophe-text-muted)]">
            Riwayat Laporan
          </h2>
          {reports.length === 0 && (
            <p className="text-sm text-[var(--strophe-text-faint)]">Belum ada laporan. Generate laporan minggu ini untuk memulai.</p>
          )}
          {reports.map((report) => (
            <Card key={report.id}>
              <p className="text-xs text-[var(--strophe-text-faint)] mb-3">Minggu {report.weekOf}</p>
              <p className="text-sm leading-relaxed mb-4">{report.weaknessesText}</p>
              <div className="border border-[var(--strophe-gold)]/40 rounded-lg p-3 bg-[var(--strophe-gold)]/5">
                <p className="text-xs uppercase tracking-wider text-[var(--strophe-gold)] mb-1">Langkah kecil minggu ini</p>
                <p className="text-sm text-[var(--strophe-gold-bright)] font-medium">{report.oneSmallStep}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
