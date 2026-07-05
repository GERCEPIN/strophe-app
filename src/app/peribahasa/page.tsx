"use client";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";

const PERIBAHASA = [
  // Disiplin
  { budaya: "Jepang", peribahasa: "Nana korobi ya oki", arti: "Jatuh tujuh kali, bangkit delapan kali.", tema: "Disiplin" },
  { budaya: "Tiongkok", peribahasa: "千里之行，始于足下", arti: "Perjalanan seribu li dimulai dari satu langkah.", tema: "Disiplin" },
  { budaya: "Jerman", peribahasa: "Übung macht den Meister", arti: "Latihan membuat seseorang menjadi ahli.", tema: "Disiplin" },
  { budaya: "Arab", peribahasa: "من جد وجد", arti: "Siapa yang bersungguh-sungguh akan berhasil.", tema: "Disiplin" },
  { budaya: "Perancis", peribahasa: "Petit à petit, l'oiseau fait son nid", arti: "Sedikit demi sedikit, burung membangun sarangnya — progres kecil konsisten menghasilkan sesuatu besar.", tema: "Disiplin" },
  // Kesabaran
  { budaya: "Turki", peribahasa: "Sabır acıdır, meyvesi tatlıdır", arti: "Kesabaran itu pahit, tapi buahnya manis.", tema: "Kesabaran" },
  { budaya: "Afrika (Swahili)", peribahasa: "Haraka haraka haina baraka", arti: "Tergesa-gesa tidak membawa berkah.", tema: "Kesabaran" },
  { budaya: "Persia", peribahasa: "صبر تلخ است ولی میوه شیرین دارد", arti: "Kesabaran pahit tapi memiliki buah yang manis.", tema: "Kesabaran" },
  // Komunitas
  { budaya: "Afrika (Ubuntu)", peribahasa: "Ubuntu: Umuntu ngumuntu ngabantu", arti: "Saya ada karena kita ada — kemanusiaan tumbuh dari kebersamaan.", tema: "Komunitas" },
  { budaya: "Korea", peribahasa: "백지장도 맞들면 낫다", arti: "Bahkan selembar kertas pun lebih ringan jika diangkat berdua.", tema: "Komunitas" },
  { budaya: "Indonesia", peribahasa: "Bersatu kita teguh, bercerai kita runtuh", arti: "Bersatu kita kuat, berpisah kita lemah.", tema: "Komunitas" },
  { budaya: "Rusia", peribahasa: "Не имей сто рублей, а имей сто друзей", arti: "Lebih baik punya seratus teman daripada seratus rubel — hubungan adalah aset sesungguhnya.", tema: "Komunitas" },
  // Belajar
  { budaya: "Yunani Kuno", peribahasa: "Γνῶθι σεαυτόν", arti: "Kenali dirimu sendiri — belajar dimulai dari memahami keterbatasan sendiri.", tema: "Belajar" },
  { budaya: "India (Sanskrit)", peribahasa: "Vidya Vihinah Pashuh", arti: "Tanpa ilmu pengetahuan, manusia bagaikan hewan.", tema: "Belajar" },
  // Keberanian
  { budaya: "Viking (Norse)", peribahasa: "Hinn vísasti maðr er sá, er lítit veit", arti: "Orang paling bijak adalah yang tahu betapa sedikit yang ia ketahui — keberanian dimulai dari kerendahan hati.", tema: "Keberanian" },
  { budaya: "Latin", peribahasa: "Audentes fortuna iuvat", arti: "Keberuntungan berpihak pada yang berani.", tema: "Keberanian" },
  { budaya: "Spanyol", peribahasa: "El que no arriesga, no gana", arti: "Yang tidak berisiko, tidak menang.", tema: "Keberanian" },
  // Waktu
  { budaya: "Inggris", peribahasa: "A stitch in time saves nine", arti: "Satu jahitan tepat waktu menghemat sembilan jahitan — bertindak lebih awal lebih efisien.", tema: "Waktu" },
  // Karakter
  { budaya: "Jawa", peribahasa: "Ajining diri ana ing lathi", arti: "Kehormatan diri ada pada ucapan — berhati-hatilah dalam berkata-kata.", tema: "Karakter" },
  { budaya: "Melayu", peribahasa: "Harimau mati meninggalkan belang, gajah mati meninggalkan gading", arti: "Orang besar meninggalkan warisan dan nama baik.", tema: "Karakter" },
];

const THEMES = Array.from(new Set(PERIBAHASA.map((p) => p.tema)));

const THEME_COLORS: Record<string, string> = {
  Disiplin: "text-[var(--strophe-gold-bright)]",
  Kesabaran: "text-blue-400",
  Komunitas: "text-green-400",
  Belajar: "text-purple-400",
  Keberanian: "text-red-400",
  Waktu: "text-orange-400",
  Karakter: "text-cyan-400",
};

export default function PeribahasaPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-in">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--strophe-gold)]">Fitur #19</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Bahasa & Peribahasa Dunia</h1>
          <p className="text-sm text-[var(--strophe-text-muted)] mt-1">
            Kebijaksanaan dari berbagai budaya — dikurasi manual, tanpa risiko halusinasi atribusi.
          </p>
        </div>

        {THEMES.map((tema) => (
          <section key={tema} className="space-y-3">
            <h2 className={`text-base font-semibold ${THEME_COLORS[tema] ?? ""}`}>{tema}</h2>
            {PERIBAHASA.filter((p) => p.tema === tema).map((p, i) => (
              <Card key={i} className="card-elevated transition-colors duration-150 hover:bg-[var(--strophe-surface-hover)]">
                <div className="space-y-1">
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[var(--strophe-surface)] border border-[var(--strophe-border)] text-[var(--strophe-text-muted)]">
                    {p.budaya}
                  </span>
                  <p className="text-sm font-medium italic mt-1">&ldquo;{p.peribahasa}&rdquo;</p>
                  <p className="text-sm text-[var(--strophe-text-muted)]">{p.arti}</p>
                </div>
              </Card>
            ))}
          </section>
        ))}

        <p className="text-xs text-[var(--strophe-text-faint)] text-center pb-4">
          Konten dikurasi manual untuk akurasi atribusi. AI tidak dipakai untuk bagian ini.
        </p>
      </div>
    </AppShell>
  );
}
