"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";

interface UnlockedCombo {
  id: string;
  comboCode: string;
  bossLevelTrack: string;
  unlockedAt: string;
}

interface ComboRule {
  code: string;
  description: string;
  requirements: { track: string; minLevel: number }[];
  bossTrack: string;
}

interface SkillComboData {
  unlocked: UnlockedCombo[];
  newlyUnlocked: UnlockedCombo[];
  allRules: ComboRule[];
}

export default function SkillComboPage() {
  const [data, setData] = useState<SkillComboData | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/skill-combo")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  const unlockedCodes = data?.unlocked.map((u) => u.comboCode) ?? [];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #15</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Skill Combo Unlock</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Capai level tertentu di beberapa track sekaligus — unlock kombinasi khusus.
          </p>
        </div>

        {data?.newlyUnlocked && data.newlyUnlocked.length > 0 && (
          <Card className="border-[var(--strophe-gold)] bg-[var(--strophe-gold)]/10">
            <p className="text-sm font-medium text-[var(--strophe-gold-bright)]">
              🎉 Combo baru di-unlock: {data.newlyUnlocked.map((u) => u.comboCode).join(", ")}
            </p>
          </Card>
        )}

        <section className="space-y-3">
          <h2 className="text-base font-semibold">Combo yang Sudah Kamu Unlock</h2>
          {loading ? (
            <p className="text-sm text-[var(--strophe-text-muted)]">Memuat...</p>
          ) : data?.unlocked.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--strophe-text-muted)]">
                Belum ada combo yang di-unlock. Terus tingkatkan level di beberapa track sekaligus.
              </p>
            </Card>
          ) : (
            data?.unlocked.map((u) => (
              <Card key={u.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{u.comboCode}</p>
                    <p className="text-xs text-[var(--strophe-text-muted)] mt-0.5">
                      Boss track: {u.bossLevelTrack}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--strophe-text-faint)] whitespace-nowrap">
                    {new Date(u.unlockedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </Card>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">Syarat Semua Combo</h2>
          {data?.allRules.map((rule) => {
            const isUnlocked = unlockedCodes.includes(rule.code);
            return (
              <Card key={rule.code} className={isUnlocked ? "border-[var(--strophe-success)]" : ""}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{rule.code}</p>
                      {isUnlocked && (
                        <span className="text-xs bg-[var(--strophe-success)]/15 text-[var(--strophe-success)] px-2 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--strophe-text-muted)]">{rule.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rule.requirements.map((req) => (
                        <span
                          key={req.track}
                          className="text-xs bg-[var(--strophe-surface)] px-2 py-0.5 rounded border border-[var(--strophe-border)]"
                        >
                          {req.track} ≥ level {req.minLevel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
