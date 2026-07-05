"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Tab = "protein" | "skin";

export default function KesehatanPage() {
  const [activeTab, setActiveTab] = useState<Tab>("protein");
  const [proteinAdvice, setProteinAdvice] = useState<string | null>(null);
  const [skinAdvice, setSkinAdvice] = useState<string | null>(null);
  const [proteinError, setProteinError] = useState<string | null>(null);
  const [skinError, setSkinError] = useState<string | null>(null);
  const [proteinLoading, setProteinLoading] = useState(false);
  const [skinLoading, setSkinLoading] = useState(false);

  function fetchProtein() {
    setProteinLoading(true);
    setProteinError(null);
    fetch("/api/health-advice?type=protein")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setProteinError(d.error);
        else setProteinAdvice(d.advice);
        setProteinLoading(false);
      })
      .catch(() => {
        setProteinError("Terjadi kesalahan. Coba lagi.");
        setProteinLoading(false);
      });
  }

  function fetchSkin() {
    setSkinLoading(true);
    setSkinError(null);
    fetch("/api/health-advice?type=skin")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setSkinError(d.error);
        else setSkinAdvice(d.advice);
        setSkinLoading(false);
      })
      .catch(() => {
        setSkinError("Terjadi kesalahan. Coba lagi.");
        setSkinLoading(false);
      });
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #29 & #30</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Kesehatan & Perawatan</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["protein", "skin"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeTab === tab
                  ? "bg-[var(--strophe-gold)]/15 border-[var(--strophe-gold)] text-[var(--strophe-gold-bright)]"
                  : "border-[var(--strophe-border)] text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]"
              }`}
            >
              {tab === "protein" ? "Nutrisi & Protein" : "Perawatan Kulit"}
            </button>
          ))}
        </div>

        {activeTab === "protein" && (
          <div className="space-y-4">
            <Card className="card-elevated animate-in stagger-1">
              <p className="text-sm text-[var(--strophe-text-muted)]">
                Panduan estimasi kebutuhan protein harian berdasarkan data fisikmu yang sudah diisi di profil kesehatan.
              </p>
            </Card>
            <Button onClick={fetchProtein} disabled={proteinLoading}>
              {proteinLoading ? "Mengambil panduan..." : "Dapatkan Panduan Nutrisi"}
            </Button>
            {proteinError && (
              <Card className="border-red-500/30">
                <p className="text-sm text-red-400">{proteinError}</p>
                <p className="text-xs text-[var(--strophe-text-faint)] mt-1">
                  Lengkapi profil kesehatan (tinggi, berat badan, aktivitas, tujuan) di halaman Profil.
                </p>
              </Card>
            )}
            {proteinAdvice && (
              <Card className="animate-in card-elevated">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{proteinAdvice}</p>
              </Card>
            )}
            <p className="text-xs text-[var(--strophe-text-faint)]">
              Panduan ini bukan rekomendasi medis. Konsultasikan dengan ahli gizi atau dokter.
            </p>
          </div>
        )}

        {activeTab === "skin" && (
          <div className="space-y-4">
            <Card className="card-elevated animate-in stagger-1">
              <p className="text-sm text-[var(--strophe-text-muted)]">
                Rutinitas perawatan kulit dasar berdasarkan tipe kulitmu yang sudah diisi di profil kesehatan.
              </p>
            </Card>
            <Button onClick={fetchSkin} disabled={skinLoading}>
              {skinLoading ? "Mengambil panduan..." : "Dapatkan Panduan Perawatan Kulit"}
            </Button>
            {skinError && (
              <Card className="border-red-500/30">
                <p className="text-sm text-red-400">{skinError}</p>
                <p className="text-xs text-[var(--strophe-text-faint)] mt-1">
                  Lengkapi profil kesehatan (tipe kulit, kekhawatiran kulit) di halaman Profil.
                </p>
              </Card>
            )}
            {skinAdvice && (
              <Card className="animate-in card-elevated">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{skinAdvice}</p>
              </Card>
            )}
            <p className="text-xs text-[var(--strophe-text-faint)]">
              Panduan ini bukan rekomendasi medis. Konsultasikan dengan dermatologis. Selalu cek label BPOM sebelum membeli produk.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
