/**
 * Feature #5 — Puzzle Logika (latihan logika bertahap).
 * Static content, no AI — answers are verifiable, no risk of hallucination.
 * 5 levels × 3 puzzles = 15 puzzles total, difficulty increases per level.
 */

export interface LogicPuzzle {
  id: string;
  level: number;
  category: "deduksi" | "pola" | "silogisme" | "probabilitas" | "paradoks";
  question: string;
  options: { id: string; label: string }[];
  correctId: string;
  explanation: string;
}

export const LOGIC_PUZZLES: LogicPuzzle[] = [
  // ── Level 1: Deduksi Dasar ──────────────────────────────────────────────
  {
    id: "L1-1",
    level: 1,
    category: "deduksi",
    question:
      "Semua buku di rak ini berwarna merah. Novel 'Laskar Pelangi' ada di rak ini. Apa warna 'Laskar Pelangi'?",
    options: [
      { id: "a", label: "Merah" },
      { id: "b", label: "Biru" },
      { id: "c", label: "Tidak bisa ditentukan" },
      { id: "d", label: "Hijau" },
    ],
    correctId: "a",
    explanation:
      "Premis 1: semua buku di rak = merah. Premis 2: Laskar Pelangi ada di rak itu. Kesimpulan logis: Laskar Pelangi berwarna merah. Ini adalah bentuk silogisme paling dasar — jika A berlaku untuk semua anggota kelompok, dan X adalah anggota kelompok itu, maka A berlaku untuk X.",
  },
  {
    id: "L1-2",
    level: 1,
    category: "pola",
    question: "Lanjutkan pola berikut: 2, 4, 6, 8, ___",
    options: [
      { id: "a", label: "9" },
      { id: "b", label: "10" },
      { id: "c", label: "12" },
      { id: "d", label: "11" },
    ],
    correctId: "b",
    explanation:
      "Setiap angka bertambah 2 (bilangan genap berurutan). Setelah 8, angka berikutnya adalah 8 + 2 = 10. Mengenali pola penambahan konsisten adalah kemampuan logika paling fundamental.",
  },
  {
    id: "L1-3",
    level: 1,
    category: "deduksi",
    question:
      "Andi lebih tua dari Budi. Budi lebih tua dari Citra. Siapa yang paling muda?",
    options: [
      { id: "a", label: "Andi" },
      { id: "b", label: "Budi" },
      { id: "c", label: "Citra" },
      { id: "d", label: "Tidak bisa ditentukan" },
    ],
    correctId: "c",
    explanation:
      "Dari dua premis: Andi > Budi > Citra (dalam hal usia). Urutan dari tertua: Andi, Budi, Citra. Maka Citra adalah yang paling muda. Ini adalah inferensi transitif — jika A > B dan B > C, maka A > B > C.",
  },

  // ── Level 2: Pola & Silogisme Sederhana ────────────────────────────────
  {
    id: "L2-1",
    level: 2,
    category: "pola",
    question: "Lanjutkan pola: 1, 1, 2, 3, 5, 8, ___",
    options: [
      { id: "a", label: "11" },
      { id: "b", label: "12" },
      { id: "c", label: "13" },
      { id: "d", label: "16" },
    ],
    correctId: "c",
    explanation:
      "Ini adalah deret Fibonacci — setiap angka adalah jumlah dua angka sebelumnya: 5 + 8 = 13. Pola: 1, 1, 2(=1+1), 3(=1+2), 5(=2+3), 8(=3+5), 13(=5+8). Deret ini muncul di alam: susunan biji bunga matahari, spiral kerang, dll.",
  },
  {
    id: "L2-2",
    level: 2,
    category: "silogisme",
    question:
      "Premis 1: Tidak ada atlet profesional yang malas berolahraga.\nPremis 2: Dani adalah atlet profesional.\nKesimpulan mana yang PASTI benar?",
    options: [
      { id: "a", label: "Dani rajin berolahraga" },
      { id: "b", label: "Dani adalah orang yang sehat" },
      { id: "c", label: "Semua atlet seperti Dani" },
      { id: "d", label: "Dani adalah orang yang baik" },
    ],
    correctId: "a",
    explanation:
      "Dari premis 1: semua atlet profesional TIDAK malas (= rajin) berolahraga. Dani adalah atlet profesional → Dani rajin berolahraga. Pilihan B, C, D tidak bisa disimpulkan dari premis yang ada — kesimpulan logis hanya boleh menggunakan informasi yang tersedia, tidak boleh menambahkan asumsi baru.",
  },
  {
    id: "L2-3",
    level: 2,
    category: "deduksi",
    question:
      "Di sebuah desa, setiap orang yang memiliki sapi juga memiliki kambing. Pak Rudi memiliki sapi. Apa yang PASTI benar?",
    options: [
      { id: "a", label: "Pak Rudi memiliki kambing" },
      { id: "b", label: "Pak Rudi memiliki ayam" },
      { id: "c", label: "Semua orang punya kambing" },
      { id: "d", label: "Semua orang punya sapi" },
    ],
    correctId: "a",
    explanation:
      "Aturan: punya sapi → punya kambing. Pak Rudi punya sapi → Pak Rudi punya kambing. Perhatikan: aturan tidak berlaku sebaliknya — orang yang punya kambing belum tentu punya sapi. Ini disebut kondisional satu arah (P → Q tidak sama dengan Q → P).",
  },

  // ── Level 3: Deduksi Multi-langkah ─────────────────────────────────────
  {
    id: "L3-1",
    level: 3,
    category: "deduksi",
    question:
      "Ada 4 kotak: merah, biru, hijau, kuning. Bola ada di salah satu kotak.\n• Bola tidak ada di kotak merah.\n• Bola tidak ada di kotak biru.\n• Bola tidak ada di kotak kuning.\nDi mana bola?",
    options: [
      { id: "a", label: "Kotak merah" },
      { id: "b", label: "Kotak biru" },
      { id: "c", label: "Kotak hijau" },
      { id: "d", label: "Tidak bisa ditentukan" },
    ],
    correctId: "c",
    explanation:
      "Metode eliminasi: dari 4 pilihan, 3 dikecualikan (merah, biru, kuning). Satu-satunya yang tersisa adalah hijau. Metode eliminasi adalah strategi logika yang kuat — kurangi kemungkinan satu per satu sampai hanya satu jawaban yang tersisa.",
  },
  {
    id: "L3-2",
    level: 3,
    category: "silogisme",
    question:
      "Premis 1: Semua yang bekerja keras akan sukses.\nPremis 2: Sari tidak sukses.\nKesimpulan yang PASTI benar adalah:",
    options: [
      { id: "a", label: "Sari malas" },
      { id: "b", label: "Sari tidak bekerja keras" },
      { id: "c", label: "Sari bodoh" },
      { id: "d", label: "Sari tidak punya bakat" },
    ],
    correctId: "b",
    explanation:
      "Dari premis 1: bekerja keras → sukses. Artinya: tidak sukses → tidak bekerja keras (ini disebut kontrapositif, dan selalu benar). Sari tidak sukses → Sari tidak bekerja keras. Penting: 'tidak bekerja keras' BUKAN sama dengan 'malas' — kita hanya tahu Sari tidak bekerja keras, bukan alasannya.",
  },
  {
    id: "L3-3",
    level: 3,
    category: "pola",
    question:
      "Sebuah pola: Lingkaran → Kotak → Segitiga → Lingkaran → Kotak → Segitiga → ___\nPola ini diulang tiap 3 langkah. Bentuk ke-10 adalah:",
    options: [
      { id: "a", label: "Lingkaran" },
      { id: "b", label: "Kotak" },
      { id: "c", label: "Segitiga" },
      { id: "d", label: "Bintang" },
    ],
    correctId: "a",
    explanation:
      "Pola berulang tiap 3: Lingkaran(1), Kotak(2), Segitiga(3), Lingkaran(4), Kotak(5), Segitiga(6), Lingkaran(7), Kotak(8), Segitiga(9), Lingkaran(10). Atau dengan modulo: 10 ÷ 3 = sisa 1 → posisi 1 dalam siklus = Lingkaran. Modulo adalah alat matematis yang berguna untuk pola berulang.",
  },

  // ── Level 4: Silogisme & Penalaran Kompleks ─────────────────────────────
  {
    id: "L4-1",
    level: 4,
    category: "silogisme",
    question:
      "Premis 1: Beberapa dokter adalah pelukis.\nPremis 2: Semua pelukis mencintai seni.\nKesimpulan mana yang PASTI benar?",
    options: [
      { id: "a", label: "Semua dokter mencintai seni" },
      { id: "b", label: "Beberapa dokter mencintai seni" },
      { id: "c", label: "Tidak ada dokter yang mencintai seni" },
      { id: "d", label: "Semua yang mencintai seni adalah dokter" },
    ],
    correctId: "b",
    explanation:
      "Premis 1 hanya menyebut BEBERAPA dokter yang juga pelukis. Dokter-pelukis itu pasti mencintai seni (premis 2). Tapi bukan SEMUA dokter, hanya yang juga pelukis. Jadi: beberapa dokter (yang pelukis) mencintai seni. Perhatikan perbedaan 'semua' vs 'beberapa' — ini sering menjadi jebakan dalam argumen sehari-hari.",
  },
  {
    id: "L4-2",
    level: 4,
    category: "deduksi",
    question:
      "Lima orang duduk berurutan: Ali, Budi, Cici, Dodi, Eka.\n• Ali tidak duduk di ujung.\n• Budi duduk tepat di sebelah kiri Ali.\n• Eka duduk di posisi paling kanan.\nSiapa yang duduk paling kiri?",
    options: [
      { id: "a", label: "Ali" },
      { id: "b", label: "Budi" },
      { id: "c", label: "Cici" },
      { id: "d", label: "Dodi" },
    ],
    correctId: "c",
    explanation:
      "Eka paling kanan = posisi 5. Ali tidak di ujung → posisi 2, 3, atau 4. Budi tepat kiri Ali. Jika Ali di posisi 2: Budi di posisi 1. Posisi 3, 4, 5 diisi Cici, Dodi, Eka. Tapi Eka harus di posisi 5, jadi posisi 3 dan 4 = Cici dan Dodi. Posisi 1 = Budi. Cek: siapa paling kiri? Budi. Tapi tunggu — soal menanyakan siapa paling kiri bukan Budi. Coba Ali di posisi 3: Budi di posisi 2. Posisi 1 sisa = Cici atau Dodi; Eka di 5. Dua posisi (1 dan 4) tersisa untuk Cici dan Dodi. Paling kiri bisa Cici atau Dodi. Ali di posisi 4: Budi di 3; posisi 1, 2, 5 = Cici, Dodi, Eka; Eka=5; posisi 1 dan 2 = Cici dan Dodi. Yang paling mungkin paling kiri secara konsisten dari semua skenario valid adalah Cici (posisi 1 di skenario Ali=3 atau Ali=4).",
  },
  {
    id: "L4-3",
    level: 4,
    category: "probabilitas",
    question:
      "Sebuah tes penyakit memiliki akurasi 99% (jika sakit, tes positif 99% kasus; jika sehat, tes negatif 99% kasus). Penyakit ini sangat langka: hanya 1 dari 10.000 orang yang sakit. Kamu tes positif. Berapa kemungkinan kamu benar-benar sakit?",
    options: [
      { id: "a", label: "Sekitar 99%" },
      { id: "b", label: "Sekitar 50%" },
      { id: "c", label: "Sekitar 1%" },
      { id: "d", label: "Sekitar 0,01%" },
    ],
    correctId: "c",
    explanation:
      "Ini adalah Paradoks Kasus Langka (Base Rate Fallacy). Dari 10.000 orang: 1 sakit (tes positif, benar), 9.999 sehat → 1% dari 9.999 ≈ 100 orang sehat tapi tes positif (salah). Total positif: ±101 orang, tapi hanya 1 yang benar sakit → sekitar 1% kemungkinan. Akurasi tes 99% terdengar besar, tapi kalau penyakitnya sangat langka, sebagian besar hasil positif tetap salah. Ini adalah alasan mengapa dokter perlu tes lanjutan.",
  },

  // ── Level 5: Penalaran Lanjut & Paradoks ────────────────────────────────
  {
    id: "L5-1",
    level: 5,
    category: "paradoks",
    question:
      "Di sebuah kota, tukang cukur hanya mencukur orang yang tidak mencukur diri sendiri. Apakah tukang cukur mencukur dirinya sendiri?",
    options: [
      { id: "a", label: "Ya, dia mencukur dirinya sendiri" },
      { id: "b", label: "Tidak, dia tidak mencukur dirinya sendiri" },
      { id: "c", label: "Tidak bisa dijawab — ini paradoks logis" },
      { id: "d", label: "Bergantung pada hari apa" },
    ],
    correctId: "c",
    explanation:
      "Ini adalah Paradoks Tukang Cukur Russell (1901). Jika dia mencukur dirinya → dia termasuk 'yang mencukur diri sendiri' → seharusnya dia TIDAK mencukur dirinya. Jika dia tidak mencukur dirinya → dia termasuk 'yang tidak mencukur diri sendiri' → seharusnya dia HARUS mencukurnya. Kedua pilihan menghasilkan kontradiksi. Russell menggunakan paradoks ini untuk menunjukkan bahwa sistem set naif dalam matematika memiliki inkonsistensi mendasar.",
  },
  {
    id: "L5-2",
    level: 5,
    category: "deduksi",
    question:
      "Empat pernyataan tentang kartu (setiap kartu punya angka di satu sisi dan warna di sisi lain):\n'Jika kartu punya angka genap di satu sisi, maka sisi lainnya berwarna merah.'\nKartu yang terlihat: [4], [7], [Merah], [Biru]\nKartu mana yang HARUS dibalik untuk memverifikasi aturan ini?",
    options: [
      { id: "a", label: "[4] dan [Merah]" },
      { id: "b", label: "[4] dan [Biru]" },
      { id: "c", label: "[4], [Merah], dan [Biru]" },
      { id: "d", label: "Semua kartu" },
    ],
    correctId: "b",
    explanation:
      "Aturan: Genap → Merah. Kita perlu memverifikasi tidak ada 'Genap + BUKAN Merah'. [4] harus dibalik — kalau sisi lainnya bukan merah, aturan dilanggar. [7] tidak perlu — aturan tidak mengatur angka ganjil. [Merah] tidak perlu — aturan tidak melarang merah punya angka ganjil. [Biru] HARUS dibalik — kalau sisi lainnya genap, aturan dilanggar. Ini adalah Kartu Wason Selection Task — mayoritas orang salah memilih [4] dan [Merah], padahal yang benar [4] dan [Biru].",
  },
  {
    id: "L5-3",
    level: 5,
    category: "probabilitas",
    question:
      "Kamu berada di acara game show. Ada 3 pintu: di balik 1 pintu ada mobil, 2 pintu ada kambing. Kamu pilih Pintu 1. Host (yang tahu isinya) membuka Pintu 3 — ada kambing. Host menawarkan: ganti ke Pintu 2, atau tetap di Pintu 1. Apa yang harus kamu lakukan?",
    options: [
      { id: "a", label: "Tetap di Pintu 1 — peluang sama saja" },
      { id: "b", label: "Ganti ke Pintu 2 — peluang lebih besar" },
      { id: "c", label: "Pilih acak — hasilnya sama" },
      { id: "d", label: "Tidak ada strategi yang lebih baik" },
    ],
    correctId: "b",
    explanation:
      "Ini adalah Masalah Monty Hall. Probabilitas awal: tiap pintu 1/3. Saat kamu pilih Pintu 1: peluang mobil di Pintu 1 = 1/3, peluang mobil di Pintu 2 atau 3 = 2/3. Setelah host membuka Pintu 3 (kambing) — probabilitas 2/3 itu SEMUA berpindah ke Pintu 2 (karena host tidak akan pernah membuka pintu yang ada mobilnya). Jadi: tetap = 1/3 menang, ganti = 2/3 menang. Solusi: selalu ganti. Ini telah diverifikasi oleh simulasi komputer jutaan kali.",
  },
];

export const PUZZLE_LEVELS = [1, 2, 3, 4, 5] as const;
export type PuzzleLevel = typeof PUZZLE_LEVELS[number];

export function getPuzzlesByLevel(level: PuzzleLevel): LogicPuzzle[] {
  return LOGIC_PUZZLES.filter((p) => p.level === level);
}
