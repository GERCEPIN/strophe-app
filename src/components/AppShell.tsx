"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dasbor" },
  { href: "/sesi-inti", label: "Sesi Inti" },
  { href: "/skill/daya-ingat", label: "Daya Ingat" },
  { href: "/puzzle-logika", label: "Puzzle Logika" },
  { href: "/akademi-saham", label: "Akademi Saham" },
  { href: "/journal", label: "Journal" },
  { href: "/kompas", label: "Kompas 5 Tahun" },
  { href: "/kamus", label: "Kamus Pribadi" },
  { href: "/reflection", label: "Refleksi" },
  { href: "/future-self", label: "Future Self" },
  { href: "/brutal-honesty", label: "Laporan Jujur" },
  { href: "/misi", label: "Misi Nyata" },
  { href: "/ibadah", label: "Ibadah" },
  { href: "/skill-radar", label: "Skill Radar" },
  { href: "/diamond-vault", label: "Diamond Vault" },
  { href: "/mentor", label: "Mentor" },
  { href: "/skill-combo", label: "Skill Combo" },
  { href: "/cross-skill", label: "Cross-Skill" },
  { href: "/kesehatan", label: "Kesehatan" },
  { href: "/keuangan", label: "Keuangan" },
  { href: "/kepribadian", label: "Kepribadian" },
  { href: "/kebersihan", label: "Kebersihan" },
  { href: "/lintas-budaya", label: "Lintas Budaya" },
  { href: "/perspektif", label: "Perspektif" },
  { href: "/bahasa-tubuh", label: "Bahasa Tubuh" },
  { href: "/peribahasa", label: "Peribahasa" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--strophe-border)] bg-[var(--strophe-bg-elevated)]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--strophe-text)]">
              STROPHE
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-[var(--strophe-gold)]">
              The Turning Point
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)] transition-colors"
          >
            Keluar
          </button>
        </div>
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-[var(--strophe-gold)]/15 text-[var(--strophe-gold-bright)] font-medium"
                    : "text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
