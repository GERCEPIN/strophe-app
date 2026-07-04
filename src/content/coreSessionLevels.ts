/**
 * Sesi Inti — Level 1-5 seed content.
 *
 * Per the spec, every day's Core Session touches all five pillars in one
 * ~10-15 minute sitting: disiplin, insting, ketelitian, mental tangguh,
 * percaya diri. Each level's `instructions` is a structured set of five
 * short, concrete tasks — not vague affirmations. Difficulty escalates
 * gradually across levels.
 *
 * To extend past level 5: add another object here following the same
 * five-section shape. See CLAUDE.md → "Extending Sesi Inti content".
 */

export interface CoreSessionLevelSeed {
  level: number;
  title: string;
  category: "campuran"; // Core Session always blends all five pillars
  durationMinutes: number;
  instructions: string;
}

export const CORE_SESSION_LEVELS: CoreSessionLevelSeed[] = [
  {
    level: 1,
    title: "Titik Balik #1 — Bangun Fondasi",
    category: "campuran",
    durationMinutes: 10,
    instructions: `**Disiplin (2 menit):** Begitu bangun, rapikan tempat tidur sampai rapi SEBELUM memegang HP untuk hal lain selain mematikan alarm.

**Insting (2 menit):** Kerjakan 3 skenario cepat di app — putuskan tiap skenario dalam maksimal 5 detik.

**Ketelitian (3 menit):** Baca paragraf pendek yang disediakan app satu kali. Tutup, lalu tulis ulang 3 detail spesifik (angka, nama, atau waktu) yang kamu ingat — tanpa melihat teks lagi.

**Mental Tangguh (2 menit):** Tulis satu hal yang bikin kamu ingin menyerah minggu ini. Di bawahnya, tulis satu kalimat kenapa hal itu tidak akan menghentikanmu.

**Percaya Diri (1 menit):** Rekam 15 detik memperkenalkan dirimu dengan suara tegas dan jelas — bukan berbisik atau terburu-buru.`,
  },
  {
    level: 2,
    title: "Titik Balik #2 — Konsistensi Kecil",
    category: "campuran",
    durationMinutes: 11,
    instructions: `**Disiplin (2 menit):** Rapikan tempat tidur seperti kemarin, DAN siapkan pakaian untuk besok malam ini juga (bukan besok pagi).

**Insting (2 menit):** 4 skenario cepat, maksimal 4 detik per keputusan.

**Ketelitian (3 menit):** Paragraf yang sedikit lebih panjang dari kemarin. Temukan dan tulis ulang 5 detail spesifik tanpa melihat teks lagi.

**Mental Tangguh (2 menit):** Tulis satu kegagalan kecil dari minggu lalu, dan satu pelajaran nyata yang kamu ambil darinya (bukan cuma "aku akan lebih baik").

**Percaya Diri (2 menit):** Rekam 20 detik menceritakan satu pencapaian kecilmu — sekecil apa pun — dengan nada yakin.`,
  },
  {
    level: 3,
    title: "Titik Balik #3 — Lawan Kebiasaan Lama",
    category: "campuran",
    durationMinutes: 12,
    instructions: `**Disiplin (3 menit):** Terapkan aturan "30 menit pertama setelah bangun tanpa membuka media sosial." Catat di app apakah berhasil atau di menit ke berapa gagal — kejujuran dicatat, bukan cuma keberhasilan.

**Insting (2 menit):** 5 skenario cepat, maksimal 3.5 detik per keputusan.

**Ketelitian (3 menit):** App menampilkan satu paragraf dengan beberapa kesalahan kecil yang disisipkan (typo, angka salah, dll). Temukan sebanyak mungkin dalam waktu terbatas.

**Mental Tangguh (2 menit):** Sebutkan satu hal tersulit yang selama ini kamu hindari. Kerjakan bagian terkecil dari hal itu selama 5 menit sekarang juga, lalu laporkan di app apa yang terjadi.

**Percaya Diri (2 menit):** Bicara di depan cermin selama 30 detik tentang topik bebas, tanpa kata "eh", "anu", atau "umm". App mencatat berapa kali kata pengisi itu muncul (self-report).`,
  },
  {
    level: 4,
    title: "Titik Balik #4 — Ketepatan di Bawah Tekanan",
    category: "campuran",
    durationMinutes: 13,
    instructions: `**Disiplin (3 menit):** Buat 3 to-do item konkret untuk hari ini, dan selesaikan minimal 1 sebelum jam 12 siang. Laporkan progresnya nanti malam.

**Insting (2 menit):** 5 skenario cepat dengan "distraktor" (informasi tidak relevan yang sengaja disisipkan untuk menguji fokus).

**Ketelitian (3 menit):** App menampilkan dua set data yang mirip. Temukan 3 perbedaan spesifik di antara keduanya.

**Mental Tangguh (3 menit):** Tulis satu ketakutan spesifik yang kamu punya (bukan yang umum), lalu tulis satu langkah sekecil apa pun untuk menghadapinya minggu ini.

**Percaya Diri (2 menit):** Rekam 30 detik menjawab pertanyaan reflektif yang diberikan app tentang dirimu sendiri, tanpa jeda diam yang lama.`,
  },
  {
    level: 5,
    title: "Titik Balik #5 — Checkpoint Minggu Pertama",
    category: "campuran",
    durationMinutes: 15,
    instructions: `**Disiplin (3 menit):** Jalankan ketiga kebiasaan dari level 1-4 sekaligus hari ini: rapikan tempat tidur, siapkan barang besok, dan selesaikan 1 to-do sebelum siang.

**Insting (3 menit):** 6 skenario campuran, termasuk 1 skenario bergaya Reverse Level (sengaja lebih sulit dan ambigu).

**Ketelitian (3 menit):** Audit satu keputusan yang kamu buat minggu ini. Tulis satu "blind spot" (hal yang luput kamu pertimbangkan saat itu).

**Mental Tangguh (3 menit):** Tulis surat singkat (3-5 kalimat) ke versi dirimu yang sedang ingin menyerah, seolah kamu sedang menyemangati orang lain.

**Percaya Diri (3 menit):** Presentasi mini 45 detik tanpa teks tentang satu topik yang kamu kuasai — anggap kamu sedang menjelaskan ke orang yang baru belajar.`,
  },
];
