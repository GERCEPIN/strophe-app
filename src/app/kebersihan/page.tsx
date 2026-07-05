"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const CHECKLIST_ITEMS = [
  "Sikat gigi pagi",
  "Sikat gigi malam",
  "Mandi pagi",
  "Cuci tangan sebelum makan",
  "Cuci tangan setelah toilet",
  "Gunting/rapikan kuku (mingguan — centang kalau sudah minggu ini)",
  "Ganti pakaian dalam",
  "Pakai deodoran/parfum",
  "Jaga kebersihan rambut",
  "Bersihkan area tidur/sprei (mingguan)",
];

interface HygieneLog {
  id: string;
  date: string;
  completedItems: string[];
}

export default function KebersihanPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HygieneLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function loadData() {
    fetch("/api/hygiene")
      .then((r) => r.json())
      .then((d) => {
        if (d.todayLog?.completedItems) {
          setChecked(new Set(d.todayLog.completedItems));
        }
        if (d.history) setHistory(d.history);
      })
      .catch(() => {});
  }

  useEffect(loadData, []);

  function toggleItem(item: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
    setSaved(false);
  }

  function saveChecklist() {
    setSaving(true);
    fetch("/api/hygiene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedItems: Array.from(checked) }),
    })
      .then((r) => r.json())
      .then(() => {
        setSaved(true);
        setSaving(false);
        loadData();
      })
      .catch(() => setSaving(false));
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #31</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Kebersihan Diri</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Checklist harian sederhana — konsistensi kecil yang terbukti mempengaruhi kesehatan dan rasa percaya diri.
          </p>
        </div>

        <Card className="card-elevated animate-in stagger-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--strophe-text-muted)] mb-3">
            Checklist Hari Ini ({checked.size}/{CHECKLIST_ITEMS.length} selesai)
          </p>
          <div className="space-y-2">
            {CHECKLIST_ITEMS.map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked.has(item)}
                  onChange={() => toggleItem(item)}
                  className="w-4 h-4 rounded accent-[var(--strophe-gold)]"
                />
                <span
                  className={`text-sm transition-colors ${
                    checked.has(item)
                      ? "text-[var(--strophe-text-muted)] line-through"
                      : "text-[var(--strophe-text)]"
                  }`}
                >
                  {item}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={saveChecklist} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Checklist Hari Ini"}
          </Button>
          {saved && <span className="text-sm text-[var(--strophe-success)]">Tersimpan!</span>}
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">Riwayat 7 Hari</h2>
          {history.length === 0 ? (
            <p className="text-sm text-[var(--strophe-text-muted)]">Belum ada riwayat.</p>
          ) : (
            history.map((log) => (
              <Card key={log.id} className="card-elevated transition-colors duration-150 hover:bg-[var(--strophe-surface-hover)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {new Date(log.date + "T00:00:00").toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="text-sm text-[var(--strophe-text-muted)]">
                    {log.completedItems.length}/{CHECKLIST_ITEMS.length} item selesai
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-[var(--strophe-border)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--strophe-gold)] rounded-full transition-all"
                    style={{ width: `${(log.completedItems.length / CHECKLIST_ITEMS.length) * 100}%` }}
                  />
                </div>
              </Card>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}
