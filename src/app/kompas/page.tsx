"use client";

import { useEffect, useState, FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Textarea, Input, Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function KompasPage() {
  const [visi5Tahun, setVisi5Tahun] = useState("");
  const [tahun1, setTahun1] = useState("");
  const [tahun5, setTahun5] = useState("");
  const [tahun10, setTahun10] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setVisi5Tahun(d.profile.visi5Tahun ?? "");
          const bp = d.profile.blueprintBisnis ?? {};
          setTahun1(bp.tahun1 ?? "");
          setTahun5(bp.tahun5 ?? "");
          setTahun10(bp.tahun10 ?? "");
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vision: { visi5Tahun, blueprintBisnis: { tahun1, tahun5, tahun10 } } }),
      });
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #23 &amp; #27</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Kompas 5 Tahun &amp; Blueprint 1-5-10</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Tiap 20 level, sistem akan mengecek keselarasan tindakan harianmu dengan visi ini.
          </p>
        </div>

        <Card className="card-elevated animate-in stagger-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="visi">Visi 5 tahun ke depan</Label>
              <Textarea id="visi" rows={4} value={visi5Tahun} onChange={(e) => setVisi5Tahun(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="t1">Target 1 tahun</Label>
                <Input id="t1" value={tahun1} onChange={(e) => setTahun1(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="t5">Target 5 tahun</Label>
                <Input id="t5" value={tahun5} onChange={(e) => setTahun5(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="t10">Target 10 tahun</Label>
                <Input id="t10" value={tahun10} onChange={(e) => setTahun10(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
            {saved && <span className="text-sm text-[var(--strophe-success)] ml-3">Tersimpan.</span>}
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
