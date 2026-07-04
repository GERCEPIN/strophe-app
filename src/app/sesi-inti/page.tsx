"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { InstingTrainer } from "@/components/InstingTrainer";

interface CoreSessionData {
  level: number;
  isReflectionLevel: boolean;
  isDiamondCheckpoint: boolean;
  content: { title: string; instructions: string; durationMinutes: number } | null;
  contentRecycledFromEarlierLevel: boolean;
  completedToday: boolean;
}

export default function SesiIntiPage() {
  const [data, setData] = useState<CoreSessionData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetch("/api/core-session")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }

  useEffect(load, []);

  async function markComplete() {
    setSubmitting(true);
    try {
      await fetch("/api/core-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      load();
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) {
    return (
      <AppShell>
        <p className="text-[var(--strophe-text-muted)]">Memuat...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Sesi Inti — Level {data.level}</p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">{data.content?.title ?? "Konten belum tersedia"}</h1>
          </div>
          {data.completedToday && (
            <span className="text-xs bg-[var(--strophe-success)]/15 text-[var(--strophe-success)] px-2.5 py-1 rounded-full">
              Selesai hari ini
            </span>
          )}
        </div>

        {data.isReflectionLevel && (
          <Card className="border-[var(--strophe-gold-dim)] text-sm">
            Level kelipatan 10 — ini Reflection Level. Setelah sesi ini, sempatkan isi refleksi di halaman Journal.
          </Card>
        )}
        {data.isDiamondCheckpoint && (
          <Card className="border-[var(--strophe-diamond)] text-sm text-[var(--strophe-diamond)]">
            Diamond Checkpoint — level kelipatan 50. Ini ujian gabungan semua skill yang pernah dipelajari.
          </Card>
        )}
        {data.contentRecycledFromEarlierLevel && (
          <p className="text-xs text-[var(--strophe-text-faint)]">
            Konten level ini masih dalam pengembangan — sementara memakai konten dari level sebelumnya sebagai
            pengulangan.
          </p>
        )}

        {data.content && (
          <Card>
            <SimpleMarkdown text={data.content.instructions} />
            <p className="text-xs text-[var(--strophe-text-faint)] mt-4">Estimasi durasi: {data.content.durationMinutes} menit</p>
          </Card>
        )}

        {!data.completedToday && (
          <Button onClick={markComplete} disabled={submitting}>
            {submitting ? "Menyimpan..." : "Tandai Sesi Selesai"}
          </Button>
        )}

        <InstingTrainer />
      </div>
    </AppShell>
  );
}
