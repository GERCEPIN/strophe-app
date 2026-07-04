"use client";

import { useEffect, useState, FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Input, Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PrayerTimings {
  Subuh: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
}

interface TimingsData {
  city: string;
  country: string;
  date: string;
  timings: PrayerTimings;
}

const PRAYER_ORDER: (keyof PrayerTimings)[] = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];

export default function IbadahPage() {
  const [timingsData, setTimingsData] = useState<TimingsData | null>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Indonesia");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function loadTimes() {
    fetch("/api/prayer-times")
      .then((res) => {
        if (res.status === 400) {
          setSetupMode(true);
          setLoading(false);
          return null;
        }
        return res.json().then((data: TimingsData | { error: string }) => {
          if ("error" in data) {
            setFetchError(data.error);
          } else {
            setTimingsData(data);
            setSetupMode(false);
          }
          setLoading(false);
        });
      })
      .catch(() => {
        setFetchError("Tidak bisa terhubung ke server.");
        setLoading(false);
      });
  }

  useEffect(loadTimes, []);

  async function handleSaveLocation(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/prayer-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, country }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setFetchError(d.error ?? "Gagal menyimpan lokasi.");
        return;
      }
      setLoading(true);
      loadTimes();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Feature #32</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Jadwal Ibadah</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Jadwal sholat berdasarkan kota kamu — diambil langsung dari Aladhan API.
          </p>
        </div>

        {loading && (
          <p className="text-sm text-[var(--strophe-text-muted)]">Memuat jadwal...</p>
        )}

        {fetchError && (
          <Card className="border-red-500/30">
            <p className="text-sm text-red-400">{fetchError}</p>
          </Card>
        )}

        {!loading && setupMode && (
          <Card>
            <h2 className="text-sm font-medium mb-3">Isi lokasi kamu</h2>
            <form onSubmit={handleSaveLocation} className="space-y-3">
              <div>
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Jakarta"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Negara</Label>
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Indonesia"
                  required
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Lokasi"}
              </Button>
            </form>
          </Card>
        )}

        {!loading && timingsData && !setupMode && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{timingsData.city}, {timingsData.country}</p>
                <p className="text-xs text-[var(--strophe-text-muted)]">{timingsData.date}</p>
              </div>
              <Button variant="ghost" onClick={() => setSetupMode(true)}>
                Perbarui Lokasi
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRAYER_ORDER.map((name) => (
                <Card key={name} className="text-center">
                  <p className="text-xs uppercase tracking-widest text-[var(--strophe-text-muted)] mb-2">{name}</p>
                  <p className="text-2xl font-[family-name:var(--font-display)] font-semibold text-[var(--strophe-gold-bright)]">
                    {timingsData.timings[name]}
                  </p>
                </Card>
              ))}
            </div>

            <p className="text-xs text-[var(--strophe-text-faint)]">
              Jadwal dari Aladhan API (aladhan.com). Verifikasi dengan jadwal lokal resmi di kota kamu.
            </p>
          </>
        )}

        {!loading && setupMode && timingsData && (
          <Button variant="ghost" onClick={() => setSetupMode(false)}>
            Batal
          </Button>
        )}
      </div>
    </AppShell>
  );
}
