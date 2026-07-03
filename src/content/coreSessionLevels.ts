import type { StationId } from '../types';

export interface StationContent {
  station: StationId;
  title: string;
  instruction: string;
  timeLimitSeconds?: number;
  inputType: 'checklist' | 'choice' | 'findIssues' | 'text';
  choices?: string[];
}

export interface LevelContent {
  level: number;
  title: string;
  stations: StationContent[];
}

/**
 * Levels 1-5 only. This is intentional, not a stub: onboarding needs a
 * controlled, predictable, hand-tuned experience (see DESIGN_STROPHE.md
 * A2 — the whole first week is deliberately paced). From level 6 onward,
 * the app falls back to reusing the level-5 pattern until Phase 2 wires
 * in AI Coach's coach/promptTemplates.ts#instingScenarioPrompt (and its
 * per-station siblings) for genuinely dynamic content — see CLAUDE.md
 * "Phase 2" for the exact next step, so this is a real hand-off, not a
 * hidden gap.
 */
export const CORE_SESSION_LEVELS: LevelContent[] = [
  {
    level: 1,
    title: 'Mulai dari Nol yang Jujur',
    stations: [
      {
        station: 'disiplin',
        title: 'Disiplin',
        instruction:
          'Sudah rapikan tempat tidur pagi ini? Sudah gosok gigi? Jawab jujur ke diri sendiri — tidak ada yang memverifikasi.',
        inputType: 'checklist',
      },
      {
        station: 'insting',
        title: 'Insting',
        instruction:
          'Waktu makan siangmu 30 menit. Kantin favorit penuh. Ada warung baru di sebelahnya yang belum pernah kamu coba. Pilih cepat — tidak ada jawaban benar, yang dinilai kecepatan & ketegasan memutuskan.',
        timeLimitSeconds: 10,
        inputType: 'choice',
        choices: ['Tunggu di kantin favorit', 'Coba warung baru'],
      },
      {
        station: 'ketelitian',
        title: 'Ketelitian',
        instruction:
          'Cari kejanggalan dalam 60 detik: "Rapat dimulai pukul 14.00, tapi undangan tertulis pukul 4 sore. Ada 12 peserta, namun daftar hadir hanya menyediakan 10 kursi. Acara akan selesai dalam 2 jam, yaitu pukul 15.30."',
        timeLimitSeconds: 60,
        inputType: 'findIssues',
      },
      {
        station: 'mentalTangguh',
        title: 'Mental Tangguh',
        instruction:
          'Sebutkan 1 hal yang gagal kamu lakukan hari ini, sekecil apa pun. Lalu tulis 1 hal yang bisa kamu lakukan beda besok.',
        inputType: 'text',
      },
      {
        station: 'percayaDiri',
        title: 'Percaya Diri',
        instruction: "Tuliskan satu kalimat yang dimulai: 'Hari ini saya berhasil...'",
        inputType: 'text',
      },
    ],
  },
  {
    level: 2,
    title: 'Jendela Waktu Menyempit',
    stations: [
      {
        station: 'disiplin',
        title: 'Disiplin',
        instruction: 'Checklist yang sama seperti kemarin — tapi selesaikan sesi ini sebelum jam 9 pagi.',
        inputType: 'checklist',
      },
      {
        station: 'insting',
        title: 'Insting',
        instruction:
          'Timer turun jadi 8 detik. Atasanmu minta laporan dikirim ulang: (A) Kirim versi lama sekarang, (B) Revisi dulu 5 menit lalu kirim, (C) Tanya dulu bagian mana yang kurang.',
        timeLimitSeconds: 8,
        inputType: 'choice',
        choices: ['Kirim versi lama sekarang', 'Revisi dulu 5 menit lalu kirim', 'Tanya dulu bagian mana yang kurang'],
      },
      {
        station: 'ketelitian',
        title: 'Ketelitian',
        instruction:
          'Cari 4 kejanggalan dalam 50 detik: "Invoice #2201 terbit 5 Mei, jatuh tempo 30 hari yaitu 3 Juni. Total tagihan Rp1.250.000, dengan diskon 10% sehingga menjadi Rp1.150.000. Pembayaran diterima via transfer ke rekening yang tertera di halaman 2 — dokumen ini hanya 1 halaman."',
        timeLimitSeconds: 50,
        inputType: 'findIssues',
      },
      {
        station: 'mentalTangguh',
        title: 'Mental Tangguh',
        instruction:
          'Dari kegagalan kecil kemarin: tulis 1 langkah konkret (bukan cuma niat) yang akan kamu lakukan beda hari ini.',
        inputType: 'text',
      },
      {
        station: 'percayaDiri',
        title: 'Percaya Diri',
        instruction: 'Baca ulang kalimat kemarin dulu, lalu tulis kalimat baru yang dimulai: "Hari ini saya berhasil..."',
        inputType: 'text',
      },
    ],
  },
  {
    level: 3,
    title: 'Distraksi Pertama',
    stations: [
      {
        station: 'disiplin',
        title: 'Disiplin',
        instruction:
          'Selesaikan checklist ini — tahan godaan untuk membuka notifikasi lain sampai sesi ini selesai.',
        inputType: 'checklist',
      },
      {
        station: 'insting',
        title: 'Insting',
        instruction:
          'Temanmu minta tolong dadakan saat kamu sedang fokus kerja: (A) Bantu sekarang, tunda kerjaanmu, (B) Minta waktu 30 menit dulu, (C) Tolak halus, tawarkan bantu nanti malam.',
        timeLimitSeconds: 8,
        inputType: 'choice',
        choices: ['Bantu sekarang, tunda kerjaanmu', 'Minta waktu 30 menit dulu', 'Tolak halus, tawarkan bantu nanti malam'],
      },
      {
        station: 'ketelitian',
        title: 'Ketelitian',
        instruction:
          'Cari 4 kejanggalan dalam instruksi kerja ini (50 detik): "Langkah 1: matikan mesin. Langkah 2: buka panel A sebelum mesin benar-benar mati. Langkah 3: lepas kabel merah, lalu kabel hitam, lalu kabel merah lagi. Langkah 4: tutup panel, nyalakan mesin dalam keadaan panel masih terbuka."',
        timeLimitSeconds: 50,
        inputType: 'findIssues',
      },
      {
        station: 'mentalTangguh',
        title: 'Mental Tangguh',
        instruction:
          '"Reappraisal" itu seperti melihat ulang foto burem — bukan menghapusnya, tapi mencari sudut yang lebih jelas. Lihat ulang kegagalan Level 1 kamu: tulis satu cara pandang baru yang lebih membantu.',
        inputType: 'text',
      },
      {
        station: 'percayaDiri',
        title: 'Percaya Diri',
        instruction: 'Tulis kalimat "Hari ini saya berhasil..." lalu tambahkan 1 alasan kenapa itu berarti buatmu.',
        inputType: 'text',
      },
    ],
  },
  {
    level: 4,
    title: 'Tekanan Waktu Nyata',
    stations: [
      {
        station: 'disiplin',
        title: 'Disiplin',
        instruction: 'Checklist hari ini, plus satu kebiasaan baru: sudah minum air putih pagi ini?',
        inputType: 'checklist',
      },
      {
        station: 'insting',
        title: 'Insting',
        instruction:
          'Dua keputusan beruntun, 7 detik masing-masing. Pertama: rapat mendadak dimajukan 15 menit — (A) Datang tanpa persiapan penuh, (B) Minta ditunda 10 menit.',
        timeLimitSeconds: 7,
        inputType: 'choice',
        choices: ['Datang tanpa persiapan penuh', 'Minta ditunda 10 menit'],
      },
      {
        station: 'ketelitian',
        title: 'Ketelitian',
        instruction:
          'Cari 5 kejanggalan dalam 45 detik (sebagian halus): "Anggaran proyek Rp50.000.000, terpakai Rp35.500.000, sisa Rp15.500.000. Proyek berjalan 6 dari rencana 8 bulan, progres fisik 60%. Deadline diperpanjang dari 8 bulan menjadi 6 bulan."',
        timeLimitSeconds: 45,
        inputType: 'findIssues',
      },
      {
        station: 'mentalTangguh',
        title: 'Mental Tangguh',
        instruction: 'Ceritakan kegagalan orang lain yang pernah kamu lihat, dan 1 pelajaran yang kamu ambil dari situ.',
        inputType: 'text',
      },
      {
        station: 'percayaDiri',
        title: 'Percaya Diri',
        instruction: 'Ucapkan kalimat afirmasimu 2x — sekali pelan, sekali tegas. Tulis mana yang terasa lebih meyakinkan buatmu.',
        inputType: 'text',
      },
    ],
  },
  {
    level: 5,
    title: 'Putaran Pertama Selesai',
    stations: [
      {
        station: 'disiplin',
        title: 'Disiplin',
        instruction: 'Rekap 5 hari terakhir: tandai jujur mana yang bolong, tanpa alasan.',
        inputType: 'text',
      },
      {
        station: 'insting',
        title: 'Insting',
        instruction:
          'Keputusan gabungan: kamu janji olahraga jam 6 pagi (disiplin), tapi bangun kesiangan jam 6.15. (A) Skip hari ini, mulai lagi besok tepat waktu, (B) Tetap olahraga versi singkat sekarang.',
        timeLimitSeconds: 6,
        inputType: 'choice',
        choices: ['Skip hari ini, mulai lagi besok tepat waktu', 'Tetap olahraga versi singkat sekarang'],
      },
      {
        station: 'ketelitian',
        title: 'Ketelitian',
        instruction:
          'Baca ulang jawaban "Mental Tangguh" kamu dari Level 1. Apakah ada ketidakkonsistenan dibanding cara kamu menjawab hari ini? Tulis pengamatanmu.',
        inputType: 'text',
      },
      {
        station: 'mentalTangguh',
        title: 'Mental Tangguh',
        instruction: 'Dari 5 hari ini, kapan kamu paling dekat menyerah? Apa yang membuatmu tetap lanjut?',
        inputType: 'text',
      },
      {
        station: 'percayaDiri',
        title: 'Percaya Diri',
        instruction:
          'Baca ulang kalimat "Hari ini saya berhasil..." dari Level 1. Menurutmu sendiri, terasa beda tidak dibanding hari ini? Kenapa?',
        inputType: 'text',
      },
    ],
  },
];

export function getLevelContent(level: number): LevelContent {
  const exact = CORE_SESSION_LEVELS.find((l) => l.level === level);
  if (exact) return exact;
  // Level 6+: fall back to the Level 5 pattern until Phase 2 wires up
  // dynamic per-station generation (see CLAUDE.md "Phase 2").
  const fallback = CORE_SESSION_LEVELS[CORE_SESSION_LEVELS.length - 1];
  return { ...fallback, level, title: `Putaran ${level}` };
}
