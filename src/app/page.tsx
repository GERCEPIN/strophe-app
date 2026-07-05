import Link from "next/link";
import { TurnArc } from "@/components/TurnArc";

const PILLARS = [
  { code: "01", title: "Disiplin & Insting", desc: "Latihan harian 10-15 menit: keputusan cepat, ketelitian, dan ketahanan gagal." },
  { code: "02", title: "Daya Ingat Nyata", desc: "Bukan klaim '100x lebih pintar' — spaced repetition, metode yang sama dipakai untuk belajar bahasa dan ujian profesi." },
  { code: "03", title: "Komunikasi & Percaya Diri", desc: "Public speaking terstruktur, Bahasa Inggris real-time, bukan pilihan ganda." },
  { code: "04", title: "Akademi Analisis Saham", desc: "Coach investor yang jujur soal keterbatasan data — tanpa rekomendasi beli/jual, murni cara berpikir." },
];

const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-md px-5 py-2.5 font-medium text-sm tracking-wide bg-[var(--strophe-gold)] text-[#14120a] hover:bg-[var(--strophe-gold-bright)] transition-colors";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">STROPHE</span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]">
            Masuk
          </Link>
          <Link href="/register" className={PRIMARY_BTN}>
            Mulai
          </Link>
        </nav>
      </header>

      <section className="max-w-5xl mx-auto w-full px-6 pt-10 pb-20 grid md:grid-cols-[1.3fr_0.7fr] gap-12 items-center">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)] mb-4">Στροφή — titik balik</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--strophe-text)]">
            Bukan aplikasi motivasi.
            <br />
            Sistem transformasi diri yang{" "}
            <span className="text-[var(--strophe-gold-bright)]">jujur soal batasnya sendiri.</span>
          </h1>
          <p className="mt-6 text-[var(--strophe-text-muted)] text-lg leading-relaxed max-w-xl">
            Level tanpa batas. Kalau hari ini kamu mentok di level 18, besok lanjut ke 19 — bukan mengulang dari
            awal. Setiap klaim diukur lewat metode nyata, dan setiap fitur yang butuh data real (kesehatan,
            keuangan, ibadah) akan bertanya ke kamu dulu, bukan mengarang.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/register" className={`${PRIMARY_BTN} px-6 py-3 text-base`}>
              Mulai Titik Balik
            </Link>
            <Link href="/login" className="text-sm text-[var(--strophe-text-muted)] hover:text-[var(--strophe-text)]">
              Sudah punya akun? Masuk →
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <TurnArc progress={0.68} size={220} strokeWidth={10}>
            <div className="text-center">
              <div className="font-[family-name:var(--font-instrument)] text-4xl font-bold text-[var(--strophe-text)]">
                34
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--strophe-text-muted)] mt-1">Level</div>
            </div>
          </TurnArc>
        </div>
      </section>

      <section className="max-w-5xl mx-auto w-full px-6 pb-24">
        <div className="grid sm:grid-cols-2 gap-px bg-[var(--strophe-border)] rounded-xl overflow-hidden border border-[var(--strophe-border)]">
          {PILLARS.map((p) => (
            <div key={p.code} className="bg-[var(--strophe-bg)] p-6 hover:bg-[var(--strophe-surface-hover)] transition-colors duration-150">
              <span className="font-[family-name:var(--font-instrument)] text-xs text-[var(--strophe-gold)]">{p.code}</span>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mt-2 mb-2">{p.title}</h3>
              <p className="text-sm text-[var(--strophe-text-muted)] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-5xl mx-auto w-full px-6 py-8 border-t border-[var(--strophe-border)] text-xs text-[var(--strophe-text-faint)]">
        STROPHE — The Turning Point. Bukan pengganti tenaga profesional (dokter, ahli gizi, penasihat keuangan,
        atau ahli agama) — app ini adalah alat latihan, bukan otoritas.
      </footer>
    </div>
  );
}
