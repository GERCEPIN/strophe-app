"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";

const SECTIONS = [
  {
    title: "1. Kontak Mata",
    points: [
      "Praktikkan kontak mata 3-5 detik saat berbicara.",
      "Saat mendengarkan, tatap mata lawan bicara lebih sering.",
      "Latihan: saat nonton video, latih tatap mata ke layar terus tanpa melihat ke tempat lain.",
    ],
  },
  {
    title: "2. Postur Tubuh",
    points: [
      "Duduk/berdiri tegak dengan bahu ke belakang dan dagu sedikit terangkat.",
      "Hindari membungkuk atau menyilangkan tangan di dada saat berbicara.",
      "Latihan: berdiri menghadap tembok dengan punggung menempel, tahan 2 menit.",
    ],
  },
  {
    title: "3. Gerakan Tangan",
    points: [
      "Gunakan gerakan tangan terbuka saat berbicara (telapak tangan terlihat).",
      "Hindari menyembunyikan tangan di saku atau di belakang punggung.",
      "Latihan: rekam dirimu berbicara 1 menit, perhatikan apa yang tangan kamu lakukan.",
    ],
  },
  {
    title: "4. Senyum & Ekspresi",
    points: [
      "Senyum tulus dimulai dari mata, bukan hanya bibir.",
      "Ekspresi wajah harus konsisten dengan kata-kata yang diucapkan.",
      "Latihan: latih 3 ekspresi di depan cermin: antusias, serius, empatik.",
    ],
  },
  {
    title: "5. Jarak & Ruang",
    points: [
      "Jaga jarak bicara yang nyaman (sekitar 60-120cm untuk percakapan profesional).",
      "Jangan terlalu dekat atau terlalu jauh.",
      "Latihan: saat percakapan berikutnya, perhatikan apakah jarak terasa nyaman untuk kedua pihak.",
    ],
  },
];

export default function BahasaTubuhPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #9</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Latihan Bahasa Tubuh</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Panduan latihan dasar bahasa tubuh — praktikkan satu per satu, tidak perlu selesai sekaligus.
          </p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <Card key={section.title}>
              <h2 className="text-base font-semibold mb-3">{section.title}</h2>
              <ul className="space-y-2">
                {section.points.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-[var(--strophe-gold)] mt-0.5 flex-shrink-0">
                      {i === section.points.length - 1 ? "→" : "•"}
                    </span>
                    <span className={i === section.points.length - 1 ? "text-[var(--strophe-text-muted)] italic" : ""}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card className="border-[var(--strophe-border)]">
          <p className="text-sm text-[var(--strophe-text-muted)] italic">
            Bahasa tubuh butuh latihan berulang — pilih satu area setiap minggu, bukan semua sekaligus.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
