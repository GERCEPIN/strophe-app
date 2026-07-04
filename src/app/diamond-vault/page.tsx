"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";

interface Checkpoint {
  id: string;
  track: string;
  levelAtCheckpoint: number;
  passedAt: string | null;
  createdAt: string;
}

interface Badge {
  id: string;
  code: string;
  title: string;
  description: string | null;
  earnedAt: string;
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

export default function DiamondVaultPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/diamond-vault")
      .then((r) => r.json())
      .then((d) => {
        setCheckpoints(d.checkpoints ?? []);
        setBadges(d.badges ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #34</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Diamond Vault</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Rekap permanen setiap Diamond Checkpoint yang sudah kamu lewati — tidak bisa hilang.
          </p>
        </div>

        {loading && (
          <p className="text-sm text-[var(--strophe-text-muted)]">Memuat vault...</p>
        )}

        {!loading && checkpoints.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--strophe-text-muted)]">
              Belum ada Diamond Checkpoint yang dilewati. Checkpoint pertama ada di level 50 Sesi Inti.
            </p>
          </Card>
        )}

        {!loading && checkpoints.length > 0 && (
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--strophe-text-muted)] mb-3">
              Diamond Checkpoints
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {checkpoints.map((cp) => (
                <Card
                  key={cp.id}
                  className="text-center border-[var(--strophe-diamond,var(--strophe-gold))]/40"
                >
                  <p
                    className="text-4xl font-[family-name:var(--font-display)] font-bold mb-1"
                    style={{ color: "var(--strophe-diamond, var(--strophe-gold))" }}
                  >
                    {cp.levelAtCheckpoint}
                  </p>
                  <p className="text-xs text-[var(--strophe-text-muted)] mb-1 capitalize">
                    {TRACK_LABELS[cp.track] ?? cp.track}
                  </p>
                  {cp.passedAt && (
                    <p className="text-xs text-[var(--strophe-text-faint)]">
                      {new Date(cp.passedAt).toLocaleDateString("id-ID")}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && badges.length > 0 && (
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-[var(--strophe-text-muted)] mb-3">
              Badge Permanen
            </h2>
            <div className="space-y-2">
              {badges.map((badge) => (
                <Card key={badge.id} className="flex items-start gap-3">
                  <div
                    className="text-2xl mt-0.5"
                    style={{ color: "var(--strophe-gold)" }}
                    aria-hidden
                  >
                    ◆
                  </div>
                  <div>
                    <p className="text-sm font-medium">{badge.title}</p>
                    {badge.description && (
                      <p className="text-xs text-[var(--strophe-text-muted)] mt-0.5">{badge.description}</p>
                    )}
                    <p className="text-xs text-[var(--strophe-text-faint)] mt-1">
                      {new Date(badge.earnedAt).toLocaleDateString("id-ID")} · {badge.code}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
