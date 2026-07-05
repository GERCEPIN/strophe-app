"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card, Input, Label, Textarea } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [visi5Tahun, setVisi5Tahun] = useState("");
  const [tahun1, setTahun1] = useState("");
  const [tahun5, setTahun5] = useState("");
  const [tahun10, setTahun10] = useState("");

  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goal, setGoal] = useState("");
  const [skinType, setSkinType] = useState("");

  const [incomeRange, setIncomeRange] = useState("");
  const [financialGoal, setFinancialGoal] = useState("");

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Indonesia");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vision: { visi5Tahun, blueprintBisnis: { tahun1, tahun5, tahun10 } },
          health: {
            heightCm: heightCm ? Number(heightCm) : undefined,
            weightKg: weightKg ? Number(weightKg) : undefined,
            goal: goal || undefined,
            skinType: skinType || undefined,
          },
          finance: { incomeRange: incomeRange || undefined, financialGoal: financialGoal || undefined },
          prayer: { city: city || undefined, country: country || undefined },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Gagal menyimpan data.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-2 animate-in">Sebelum mulai</h1>
        <p className="text-sm text-[var(--strophe-text-muted)] mb-6 leading-relaxed">
          Semua data ini dipakai supaya Coach AI tidak pernah mengarang angka soal kondisimu. Boleh dilewati dan
          diisi belakangan lewat halaman ini — tapi fitur kesehatan, keuangan, dan ibadah baru akan memberi saran
          spesifik setelah datanya ada.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="card-elevated animate-in stagger-1">
            <h2 className="font-[family-name:var(--font-display)] font-semibold mb-1">Kompas 5 Tahun</h2>
            <p className="text-xs text-[var(--strophe-text-muted)] mb-4">Fitur #23 &amp; #27 — dicek keselarasannya tiap 20 level.</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="visi">Visi 5 tahun ke depan</Label>
                <Textarea id="visi" rows={3} value={visi5Tahun} onChange={(e) => setVisi5Tahun(e.target.value)} placeholder="Mau jadi seperti apa 5 tahun lagi?" />
              </div>
              <div className="grid grid-cols-3 gap-3">
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
            </div>
          </Card>

          <Card className="card-elevated animate-in stagger-2">
            <h2 className="font-[family-name:var(--font-display)] font-semibold mb-1">⚠️ Kesehatan &amp; Kulit</h2>
            <p className="text-xs text-[var(--strophe-text-muted)] mb-4">
              Fitur #29 &amp; #30 — wajib diisi dulu sebelum Coach memberi saran protein atau perawatan wajah.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="height">Tinggi badan (cm)</Label>
                <Input id="height" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="weight">Berat badan (kg)</Label>
                <Input id="weight" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="goal">Tujuan bentuk tubuh</Label>
                <select
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-md border border-[var(--strophe-border-strong)] bg-[var(--strophe-bg-elevated)] px-3.5 py-2.5"
                >
                  <option value="">Pilih...</option>
                  <option value="kurus">Kurus</option>
                  <option value="ideal">Ideal</option>
                  <option value="otot">Otot</option>
                </select>
              </div>
              <div>
                <Label htmlFor="skin">Jenis kulit</Label>
                <select
                  id="skin"
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full rounded-md border border-[var(--strophe-border-strong)] bg-[var(--strophe-bg-elevated)] px-3.5 py-2.5"
                >
                  <option value="">Pilih...</option>
                  <option value="kering">Kering</option>
                  <option value="oily">Oily</option>
                  <option value="sensitif">Sensitif</option>
                  <option value="kombinasi">Kombinasi</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-[family-name:var(--font-display)] font-semibold mb-1">⚠️ Keuangan</h2>
            <p className="text-xs text-[var(--strophe-text-muted)] mb-4">Fitur #33 — boleh diisi rentang saja, tidak perlu angka pasti.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="income">Rentang penghasilan/bulan</Label>
                <Input id="income" value={incomeRange} onChange={(e) => setIncomeRange(e.target.value)} placeholder="mis. 5-10 juta" />
              </div>
              <div>
                <Label htmlFor="fingoal">Target keuangan</Label>
                <Input id="fingoal" value={financialGoal} onChange={(e) => setFinancialGoal(e.target.value)} placeholder="mis. dana darurat 6 bulan" />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-[family-name:var(--font-display)] font-semibold mb-1">⚠️ Lokasi (untuk Ibadah)</h2>
            <p className="text-xs text-[var(--strophe-text-muted)] mb-4">
              Fitur #32 — dipakai untuk cari jadwal sholat dari sumber resmi berdasarkan kotamu.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">Kota</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="mis. Bandung" />
              </div>
              <div>
                <Label htmlFor="country">Negara</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
          </Card>

          {error && <p className="text-sm text-[var(--strophe-danger)]">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan & Mulai"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")}>
              Lewati untuk sekarang
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
