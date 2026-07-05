"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function KeuanganPage() {
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function fetchAdvice() {
    setLoading(true);
    setError(null);
    fetch("/api/finance-advice")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setAdvice(d.advice);
        setLoading(false);
      })
      .catch(() => {
        setError("Terjadi kesalahan. Coba lagi.");
        setLoading(false);
      });
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #33</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Panduan Keuangan</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Prinsip dasar keuangan berdasarkan profil kamu — bukan saran investasi.
          </p>
        </div>

        <Card className="card-elevated animate-in stagger-1 border-[var(--strophe-gold-dim)]">
          <p className="text-xs text-[var(--strophe-gold-bright)] font-medium mb-1">DISCLAIMER PENTING</p>
          <p className="text-sm text-[var(--strophe-text-muted)]">
            Panduan ini hanya prinsip keuangan dasar — BUKAN saran investasi. Untuk keputusan investasi,
            konsultasikan dengan perencana keuangan berlisensi (CFP). Angka saham, reksa dana, atau kripto
            tidak akan disebutkan karena butuh data real-time yang harus kamu cari sendiri.
          </p>
        </Card>

        <Button onClick={fetchAdvice} disabled={loading}>
          {loading ? "Mengambil panduan..." : "Dapatkan Panduan Keuangan"}
        </Button>

        {error && (
          <Card className="border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
            <p className="text-xs text-[var(--strophe-text-faint)] mt-1">
              Lengkapi profil keuangan (penghasilan, pengeluaran bulanan, tujuan keuangan) di halaman Profil.
            </p>
          </Card>
        )}

        {advice && (
          <Card className="animate-in card-elevated">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{advice}</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
