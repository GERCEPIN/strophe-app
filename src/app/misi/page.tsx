"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Textarea, Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Mission {
  id: string;
  missionText: string;
  category: string;
  status: string;
  reportText: string | null;
  createdAt: string;
  reportedAt: string | null;
}

export default function MisiPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportTexts, setReportTexts] = useState<Record<string, string>>({});
  const [reportingId, setReportingId] = useState<string | null>(null);

  function load() {
    fetch("/api/mission")
      .then((r) => r.json())
      .then((d) => setMissions(d.missions ?? []))
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleGenerate(isZonaNyamanBreaker: boolean) {
    setLoading(true);
    try {
      await fetch("/api/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isZonaNyamanBreaker }),
      });
      load();
    } finally {
      setLoading(false);
    }
  }

  async function handleReport(missionId: string) {
    const reportText = reportTexts[missionId] ?? "";
    if (reportText.trim().length < 10) return;
    setReportingId(missionId);
    try {
      await fetch("/api/mission", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, reportText }),
      });
      setReportTexts((prev) => ({ ...prev, [missionId]: "" }));
      load();
    } finally {
      setReportingId(null);
    }
  }

  const activeMission = missions.find((m) => m.status === "assigned");
  const completedMissions = missions.filter((m) => m.status === "reported");

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #16/#17</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Misi Nyata</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            AI generate misi dunia nyata untukmu. Lapor hasilnya dengan jujur.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => handleGenerate(false)} disabled={loading}>
            {loading ? "Membuat misi..." : "Misi Biasa"}
          </Button>
          <Button variant="danger" onClick={() => handleGenerate(true)} disabled={loading}>
            Uji Zona Nyaman
          </Button>
        </div>

        {activeMission && (
          <Card className="border-[var(--strophe-gold)]/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-[var(--strophe-gold)]">Misi Aktif</span>
              {activeMission.category === "zona_nyaman_breaker" && (
                <span className="text-xs bg-red-500/20 text-red-400 rounded px-2 py-0.5">Zona Nyaman Breaker</span>
              )}
            </div>
            <p className="text-base font-medium mb-4">{activeMission.missionText}</p>

            <div className="space-y-2">
              <Label htmlFor={`report-${activeMission.id}`}>Laporan hasil misi</Label>
              <Textarea
                id={`report-${activeMission.id}`}
                rows={3}
                placeholder="Ceritakan apa yang terjadi — jujur, termasuk kalau gagal."
                value={reportTexts[activeMission.id] ?? ""}
                onChange={(e) =>
                  setReportTexts((prev) => ({ ...prev, [activeMission.id]: e.target.value }))
                }
              />
              <Button
                variant="secondary"
                onClick={() => handleReport(activeMission.id)}
                disabled={
                  reportingId === activeMission.id ||
                  (reportTexts[activeMission.id] ?? "").trim().length < 10
                }
              >
                {reportingId === activeMission.id ? "Menyimpan..." : "Lapor Hasil"}
              </Button>
            </div>
          </Card>
        )}

        {completedMissions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--strophe-text-muted)]">
              Misi Selesai
            </h2>
            {completedMissions.map((m) => (
              <Card key={m.id} className="opacity-80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[var(--strophe-text-faint)]">
                    {new Date(m.createdAt).toLocaleDateString("id-ID")}
                  </span>
                  {m.category === "zona_nyaman_breaker" && (
                    <span className="text-xs bg-red-500/10 text-red-400 rounded px-2 py-0.5">ZNB</span>
                  )}
                </div>
                <p className="text-sm font-medium mb-2">{m.missionText}</p>
                {m.reportText && (
                  <p className="text-xs text-[var(--strophe-text-muted)] border-t border-[var(--strophe-border)] pt-2 mt-2">
                    {m.reportText}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
