/**
 * Memory Vault — Level 1-5 seed content (Sesi Skill Rotasi: daya ingat).
 *
 * Each level teaches ONE real, named memory technique (not a vague "brain
 * boost" claim — rule #5) through a recall prompt. Reviews are Anki-style:
 * the user reads the prompt, tries to recall, reveals the answer, and
 * self-grades 0-5 — which feeds directly into lib/engine/spacedRepetition.ts.
 *
 * Level 5 deliberately teaches Spaced Repetition itself, so the user
 * understands *why* the app works the way it does.
 */

export interface MemoryVaultLevelSeed {
  level: number;
  term: string;
  prompt: string;
  answer: string;
  explanation: string;
}

export const MEMORY_VAULT_LEVELS: MemoryVaultLevelSeed[] = [
  {
    level: 1,
    term: "Chunking",
    prompt: "Apa itu teknik Chunking dalam mengingat, dan kenapa nomor telepon ditulis berkelompok (misal 0812-3456-789) bukan satu deret panjang?",
    answer:
      "Chunking = memecah informasi panjang jadi kelompok-kelompok kecil supaya lebih mudah diingat. Nomor telepon dipecah per beberapa digit karena otak lebih gampang menyimpan 3-4 kelompok kecil dibanding 11 digit acak sekaligus.",
    explanation:
      "Analogi: bayangkan bawa belanjaan. 11 barang lepas di tangan itu berat dan gampang jatuh, tapi kalau dibagi jadi 3 kantong kecil, jauh lebih ringan dibawa — otak kita bekerja mirip begitu dengan informasi.",
  },
  {
    level: 2,
    term: "Metode Loci (Istana Ingatan)",
    prompt:
      "Jelaskan cara kerja Metode Loci: bagaimana caranya mengingat daftar 5 barang belanjaan dengan membayangkan rumahmu?",
    answer:
      "Tempatkan setiap barang secara imajiner di titik-titik yang sudah kamu kenal di rumahmu (pintu depan, ruang tamu, dapur, kamar, kamar mandi) — lalu untuk mengingat, kamu 'berjalan' secara mental melewati titik-titik itu satu per satu.",
    explanation:
      "Analogi: ini seperti menaruh barang di loker-loker yang sudah kamu hafal nomornya, dibanding menaruhnya sembarangan di satu tumpukan besar — jauh lebih mudah menemukannya lagi.",
  },
  {
    level: 3,
    term: "Akronim & Akrostik",
    prompt:
      "Buat satu akronim atau akrostik sederhana untuk mengingat urutan: Merah, Jingga, Kuning, Hijau, Biru (urutan pelangi sebagian).",
    answer:
      "Contoh akrostik: 'Mereka Jangan Kemana-mana, Harus Bersama' (Merah, Jingga, Kuning, Hijau, Biru) — kalimat konyol justru lebih gampang nempel di ingatan.",
    explanation:
      "Analogi: otak lebih gampang ingat cerita atau kalimat yang punya makna (walau lucu/aneh) dibanding huruf/angka lepas — seperti lebih gampang ingat lagu dibanding daftar kata acak.",
  },
  {
    level: 4,
    term: "Asosiasi Visual Berlebihan (Exaggerated Visualization)",
    prompt:
      "Bagaimana cara mengingat nama 'Pak Budi yang jualan Buku' dengan teknik asosiasi visual yang dilebih-lebihkan?",
    answer:
      "Bayangkan Pak Budi secara visual sedang tenggelam di tumpukan buku raksasa yang jatuh dari langit — semakin aneh, besar, atau lucu bayangannya, semakin gampang otak mengingatnya nanti.",
    explanation:
      "Analogi: iklan yang biasa-biasa saja gampang dilupakan, tapi iklan yang aneh atau lucu justru nempel di kepala berhari-hari — otak kita memang lebih ingat hal yang 'menonjol', bukan yang datar.",
  },
  {
    level: 5,
    term: "Spaced Repetition (Pengulangan Berjarak)",
    prompt:
      "Kenapa mengulang materi dengan jarak waktu yang makin lama (1 hari, lalu 6 hari, lalu makin lama lagi) lebih efektif daripada belajar maraton semalam sebelum ujian?",
    answer:
      "Karena ingatan melemah seiring waktu (disebut 'kurva lupa'). Mengulang tepat sebelum kamu benar-benar lupa memperkuat jejak ingatan itu secara efisien, sementara belajar maraton cuma masuk ke ingatan jangka pendek yang cepat hilang.",
    explanation:
      "Analogi: ini seperti menyiram tanaman sedikit demi sedikit secara rutin dibanding menyiramnya banjir sekali lalu dibiarkan kering berminggu-minggu — akarnya (ingatan jangka panjang) tumbuh lebih kuat dengan pola rutin. Ini persis metode yang dipakai Memory Vault di app ini.",
  },
];
