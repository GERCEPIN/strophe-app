/**
 * Akademi Analisis Saham → Kategori Analisis Fundamental, Level 1-5.
 *
 * Every number in the case study is fictional and the fields make that
 * explicit (`isIllustrative`, plus the label repeated in the text itself,
 * per the module's ATURAN KHUSUS #3). Concepts are real; data is not.
 */

export interface StockLessonSeed {
  level: number;
  title: string;
  analogy: string;
  contentMarkdown: string;
}

export const STOCK_FUNDAMENTAL_LEVELS: StockLessonSeed[] = [
  {
    level: 1,
    title: "Membaca Neraca (Balance Sheet)",
    analogy: "Neraca = foto kekayaan perusahaan di satu titik waktu.",
    contentMarkdown: `Neraca menunjukkan tiga hal di satu tanggal tertentu:
- **Aset** — semua yang dimiliki perusahaan (uang, gedung, mesin, piutang).
- **Liabilitas** — semua yang menjadi utang perusahaan.
- **Ekuitas** — sisa kekayaan pemilik setelah utang dilunasi (Aset − Liabilitas).

Bayangkan neraca seperti **foto isi dompet dan utangmu hari ini** — bukan
cerita tentang bagaimana kamu mendapatkan uang itu, cuma potret kondisi
saat ini.`,
  },
  {
    level: 2,
    title: "Membaca Laba Rugi & Arus Kas",
    analogy: "Laba rugi = rapor untung-rugi. Arus kas = aliran uang masuk-keluar dompet perusahaan.",
    contentMarkdown: `**Laporan Laba Rugi** menunjukkan performa selama satu periode (misal 1
tahun): pendapatan dikurangi biaya-biaya sampai ketemu laba/rugi bersih —
seperti rapor sekolah yang merangkum satu semester, bukan satu hari.

**Laporan Arus Kas** menunjukkan uang tunai yang benar-benar masuk dan
keluar — penting karena perusahaan bisa saja "untung di atas kertas" tapi
kehabisan uang tunai untuk bayar operasional, mirip orang yang gajinya
besar tapi selalu telat bayar tagihan karena uangnya belum benar-benar cair.`,
  },
  {
    level: 3,
    title: "Rasio Dasar: PER, EPS, PBV",
    analogy: "PER = kira-kira berapa lama modal balik kalau untungnya segini terus.",
    contentMarkdown: `- **EPS (Earnings per Share)** — laba bersih dibagi jumlah saham beredar.
  Ini "jatah untung" per satu lembar saham.
- **PER (Price to Earnings Ratio)** — harga saham dibagi EPS. Analoginya:
  kalau kamu beli warung seharga 100 juta dan untungnya 10 juta/tahun,
  PER-nya 10x — kira-kira 10 tahun modal balik KALAU untungnya segitu terus
  (dan kenyataannya jarang persis segitu terus).
- **PBV (Price to Book Value)** — harga saham dibanding nilai buku (aset
  bersih) per saham. Analoginya: apakah kamu membayar lebih mahal atau
  lebih murah dari "harga barang bekasnya" kalau perusahaan itu dijual
  aset-asetnya hari ini.`,
  },
  {
    level: 4,
    title: "Rasio Profitabilitas & Leverage: ROE, ROA, DER, Dividend Yield",
    analogy: "ROE = seberapa efisien modal pemilik 'dikerjain' menghasilkan untung.",
    contentMarkdown: `- **ROE (Return on Equity)** — laba bersih dibagi ekuitas. Makin tinggi,
  makin efisien perusahaan memutar modal pemiliknya jadi untung.
- **ROA (Return on Assets)** — laba bersih dibagi total aset. Mirip ROE
  tapi mengukur efisiensi memakai SEMUA aset, bukan cuma modal pemilik.
- **DER (Debt to Equity Ratio)** — total utang dibagi ekuitas. Analoginya:
  rasio ini seperti mengecek berapa besar rumahmu dibiayai KPR dibanding
  uangmu sendiri — makin tinggi DER, makin besar beban cicilan/bunga yang
  harus ditanggung.
- **Dividend Yield** — dividen per saham dibagi harga saham. Ini seperti
  "bunga tahunan" yang kamu dapat dari memegang saham itu, di luar
  kenaikan/penurunan harganya.`,
  },
  {
    level: 5,
    title: "Analisis Kualitatif: Moat, Manajemen, dan Posisi Industri",
    analogy: "Moat = parit pelindung benteng — seberapa susah pesaing merebut posisi perusahaan ini.",
    contentMarkdown: `Angka-angka di laporan keuangan cuma separuh cerita. Yang juga penting:

- **Moat (keunggulan bersaing)** — apa yang membuat perusahaan ini susah
  ditiru atau disaingi? (merek kuat, biaya produksi lebih murah, hak paten,
  jaringan distribusi luas, dll.)
- **Kualitas manajemen (GCG - Good Corporate Governance)** — apakah
  manajemen punya rekam jejak jujur ke pemegang saham, atau justru sering
  bikin keputusan yang menguntungkan diri sendiri?
- **Posisi di industri** — apakah perusahaan ini pemimpin pasar, pemain
  menengah, atau justru sedang tergerus pesaing baru?
- **Sensitivitas regulasi** — seberapa besar bisnis ini bisa terguncang
  kalau ada perubahan kebijakan pemerintah di sektornya?

Analoginya: dua warung bisa punya laporan keuangan mirip, tapi warung yang
lokasinya strategis dan resepnya susah ditiru (moat kuat) jauh lebih tahan
banting kalau ada warung baru buka di sebelahnya.`,
  },
];

export const FUNDAMENTAL_LEVEL1_CASE_STUDY = {
  scenarioText: `⚠️ ILUSTRASI — bukan data emiten nyata.

PT Contoh Makmur Tbk (kode fiktif: "CTMI") melaporkan neraca akhir tahun:
- Total Aset: Rp 500 miliar (ILUSTRASI)
- Total Liabilitas: Rp 200 miliar (ILUSTRASI)
- Total Ekuitas: Rp 300 miliar (ILUSTRASI)

Ini contoh ilustrasi, bukan data emiten nyata — dipakai hanya untuk latihan
cara membaca neraca.`,
  guidingQuestions: [
    "Dari angka di atas, berapa persen aset CTMI (fiktif) yang dibiayai oleh utang, dan berapa persen oleh modal pemilik sendiri?",
    "Kalau kamu cuma lihat angka ini tanpa data lain, apa yang BELUM bisa kamu simpulkan tentang seberapa sehat bisnis CTMI (fiktif)?",
    "Data real apa yang perlu kamu cari sendiri (dari IDX/Stockbit/RTI) sebelum bisa menilai perusahaan sungguhan?",
  ],
};
