"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Input, Label } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "daftar" ? "daftar" : "masuk";

  const [tab, setTab] = useState<"masuk" | "daftar">(defaultTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchTab(t: "masuk" | "daftar") {
    setTab(t);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "masuk") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Gagal masuk."); return; }
        router.push(searchParams.get("next") ?? "/dashboard");
        router.refresh();
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Gagal mendaftar."); return; }
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm animate-in">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)] mb-4">Titik Balik</p>

      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[var(--strophe-bg-elevated)]">
        <button
          type="button"
          onClick={() => switchTab("masuk")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
            tab === "masuk"
              ? "bg-[var(--strophe-surface)] text-[var(--strophe-text)] shadow-sm"
              : "text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]"
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => switchTab("daftar")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
            tab === "daftar"
              ? "bg-[var(--strophe-surface)] text-[var(--strophe-text)] shadow-sm"
              : "text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]"
          }`}
        >
          Buat Akun
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === "daftar" && (
          <div className="animate-in">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={tab === "daftar" ? 8 : 1}
          />
        </div>
        {error && <p className="text-sm text-[var(--strophe-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : tab === "masuk" ? "Masuk" : "Buat Akun"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
