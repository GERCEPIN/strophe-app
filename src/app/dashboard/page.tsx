"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { TurnArc } from "@/components/TurnArc";
import { Button } from "@/components/ui/Button";

interface DashboardData {
  user: { name: string; email: string } | null;
  tracks: { track: string; currentLevel: number; highestLevelReached: number }[];
  mentalScore: { mentalScore: number; streakDays: number };
  showPanicButton: boolean;
  diamond: { highestPassedCheckpoint: number; nextCheckpointLevel: number } | null;
  badges: { id: string; title: string }[];
}

const TRACK_LABELS: Record<string, string> = {
  core: "Sesi Inti",
  daya_ingat: "Daya Ingat",
  bahasa_inggris: "Bahasa Inggris",
  public_speaking: "Public Speaking",
  jangka_panjang: "Jangka Panjang",
  kesehatan: "Kesehatan",
  keuangan: "Keuangan",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [showPanic, setShowPanic] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <AppShell>
        <p className="text-[var(--strophe-text-muted)]">Memuat...</p>
      </AppShell>
    );
  }

  const coreTrack = data.tracks.find((t) => t.track === "core");
  const coreProgressToCheckpoint = data.diamond
    ? ((coreTrack?.currentLevel ?? 1) % 50) / 50
    : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Selamat datang kembali</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">{data.user?.name ?? "—"}</h1>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="flex items-center gap-4">
            <TurnArc progress={coreProgressToCheckpoint} size={80} strokeWidth={7}>
              <span className="font-[family-name:var(--font-instrument)] text-xl font-bold">{coreTrack?.currentLevel ?? 1}</span>
            </TurnArc>
            <div>
              <p className="text-xs text-[var(--strophe-text-muted)] uppercase tracking-wider">Sesi Inti</p>
              <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
                Menuju checkpoint level {data.diamond?.nextCheckpointLevel ?? 50}
              </p>
            </div>
          </Card>

          <Card>
            <p className="text-xs text-[var(--strophe-text-muted)] uppercase tracking-wider mb-1">Mental Score</p>
            <p className="font-[family-name:var(--font-instrument)] text-3xl font-bold">
              {data.mentalScore.mentalScore}
              <span className="text-sm text-[var(--strophe-text-muted)]">/100</span>
            </p>
            <p className="text-xs text-[var(--strophe-text-muted)] mt-1">Streak: {data.mentalScore.streakDays} hari</p>
          </Card>

          <Card>
            <p className="text-xs text-[var(--strophe-text-muted)] uppercase tracking-wider mb-1">Diamond Checkpoint Terakhir</p>
            <p className="font-[family-name:var(--font-instrument)] text-3xl font-bold text-[var(--strophe-diamond)]">
              {data.diamond?.highestPassedCheckpoint ?? 0}
            </p>
            <p className="text-xs text-[var(--strophe-text-muted)] mt-1">{data.badges.length} lencana permanen</p>
          </Card>
        </div>

        {data.showPanicButton && !showPanic && (
          <Card className="border-[var(--strophe-danger-dim)] bg-[var(--strophe-danger-dim)]/10">
            <p className="text-sm mb-3">
              Mental score kamu lagi rendah. Sebelum menyerah, coba satu micro-challenge 60 detik dulu.
            </p>
            <Button variant="secondary" onClick={() => setShowPanic(true)}>
              Mulai Micro-Challenge
            </Button>
          </Card>
        )}
        {showPanic && (
          <Card className="border-[var(--strophe-gold-dim)]">
            <p className="text-sm mb-3 font-medium">Micro-challenge 60 detik: Tarik napas dalam 4 hitungan, tahan 4 hitungan, buang 4 hitungan. Ulangi 4x. Lalu buka Sesi Inti hari ini — cukup mulai, tidak usah selesai sekaligus.</p>
            <Link href="/sesi-inti">
              <Button>Buka Sesi Inti</Button>
            </Link>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/sesi-inti">
            <Card className="hover:border-[var(--strophe-gold)] transition-colors cursor-pointer h-full">
              <h3 className="font-[family-name:var(--font-display)] font-semibold mb-1">Sesi Inti Hari Ini</h3>
              <p className="text-sm text-[var(--strophe-text-muted)]">Disiplin, insting, ketelitian, mental tangguh, percaya diri.</p>
            </Card>
          </Link>
          <Link href="/skill/daya-ingat">
            <Card className="hover:border-[var(--strophe-gold)] transition-colors cursor-pointer h-full">
              <h3 className="font-[family-name:var(--font-display)] font-semibold mb-1">Memory Vault</h3>
              <p className="text-sm text-[var(--strophe-text-muted)]">Review materi yang jatuh tempo hari ini.</p>
            </Card>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {data.tracks
            .filter((t) => t.track !== "core")
            .map((t) => (
              <div key={t.track} className="flex justify-between border-b border-[var(--strophe-border)] py-2">
                <span className="text-[var(--strophe-text-muted)]">{TRACK_LABELS[t.track] ?? t.track}</span>
                <span className="font-[family-name:var(--font-instrument)]">Lv {t.currentLevel}</span>
              </div>
            ))}
        </div>
      </div>
    </AppShell>
  );
}
