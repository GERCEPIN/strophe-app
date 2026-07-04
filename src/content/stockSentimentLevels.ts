/**
 * Akademi Analisis Saham → Kategori Sentimen & Berita, Level 1-5.
 *
 * Semua nama emiten, angka, dan kejadian adalah ILUSTRASI.
 */

import { StockLessonSeed } from "./stockFundamentalLevels";

export const STOCK_SENTIMENT_LEVELS: StockLessonSeed[] = [
  {
    level: 1,
    title: "Memahami Sentimen Pasar",
    analogy:
      "Sentimen = mood pasar — bisa lebih kuat dari fundamental dalam jangka pendek.",
    contentMarkdown: `**Sentimen pasar** adalah persepsi kolektif para pelaku pasar tentang arah harga — apakah mereka secara umum optimis (bullish) atau pesimis (bearish).

**Dua kutub sentimen:**
- **Greed (keserakahan)** — banyak investor berlomba-lomba membeli karena takut ketinggalan kenaikan (FOMO). Harga bisa jauh melampaui nilai fundamentalnya.
- **Fear (ketakutan)** — banyak investor berlomba menjual karena takut rugi lebih besar. Harga bisa turun jauh di bawah nilai fundamentalnya.

**Mengapa ini penting?**
Dalam jangka pendek, sentimen bisa mendorong harga jauh dari nilai intrinsiknya. Dalam jangka panjang, fundamental biasanya "menang" — tapi "jangka panjang" bisa bertahun-tahun, lebih lama dari ketahanan finansial banyak investor.

**Implikasi praktis:**
- Membeli saat semua orang euforia sangat berisiko — kamu mungkin membeli di puncak sentimen.
- Menjual saat semua orang panik juga berisiko — kamu mungkin menjual di dasar.
- Pemahaman sentimen membantu kamu tidak terbawa arus emosi pasar.

**Indikator sentimen populer:**
- Fear & Greed Index (tersedia online untuk pasar AS, bisa dijadikan referensi umum).
- Indeks VIX (volatility index) — semakin tinggi, semakin besar ketakutan pasar.

⚠️ Jangan gunakan sentimen sebagai satu-satunya dasar keputusan investasi.`,
  },
  {
    level: 2,
    title: "Membaca Berita Korporasi",
    analogy:
      "Berita emiten = sumber sinyal — tapi kamu harus baca kritis, bukan telan mentah-mentah.",
    contentMarkdown: `Emiten di BEI wajib mempublikasikan informasi material secara terbuka (keterbukaan informasi). Beberapa jenis berita korporasi yang paling berdampak:

**1. Laporan keuangan (earnings release)**
Rilis setiap kuartal. Yang diperhatikan: apakah laba di atas atau di bawah ekspektasi analis? Pertumbuhan revenue? Marjin?

**2. Rights Issue (penawaran saham baru)**
Perusahaan menerbitkan saham baru untuk mengumpulkan modal. Dampak: dilusi kepemilikan pemegang saham lama — persentase kepemilikanmu di perusahaan mengecil kalau kamu tidak ikut membeli rights. Berita ini sering menekan harga saham jangka pendek.

**3. Stock Split**
Perusahaan memecah saham menjadi lebih banyak dengan harga per lembar yang lebih kecil (contoh: 1 lembar @ Rp 5.000 jadi 5 lembar @ Rp 1.000 — ILUSTRASI). Total nilai tetap sama, tapi likuiditas meningkat. Secara fundamental tidak mengubah nilai perusahaan.

**4. Merger & Akuisisi**
Penggabungan dua perusahaan atau pembelian perusahaan lain. Dampaknya sangat bergantung pada harga, sinergi yang realistis, dan kondisi utang.

**Cara membaca kritis:**
- Selalu baca sumber primernya: keterbukaan informasi di IDX (idx.co.id), bukan hanya ringkasan portal berita.
- Tanya: apakah ini mengubah fundamental jangka panjang, atau hanya berita sesaat?
- Waspadai press release yang terlalu positif — baca juga bagian "risiko" dan "disclamer".

⚠️ Semua contoh di atas ILUSTRASI. Data riil wajib diambil dari IDX.`,
  },
  {
    level: 3,
    title: "Media Sosial & FOMO",
    analogy:
      "Grup WA saham = bisa info berguna, bisa noise berbahaya.",
    contentMarkdown: `Di era media sosial, informasi (dan misinformasi) tentang saham menyebar sangat cepat melalui grup WhatsApp, Telegram, Twitter/X, YouTube, dan TikTok.

**Risiko utama: Pump & Dump**
Skema ilegal di mana sekelompok orang membeli saham tertentu secara masif (pump), lalu menyebarkan informasi positif palsu untuk menarik lebih banyak pembeli, kemudian menjual di harga tinggi saat banyak pembeli masuk (dump). Pembeli terakhir yang rugi.

**Tanda-tanda peringatan:**
- Saham tiba-tiba viral di media sosial tanpa berita fundamental yang jelas.
- "Rekomendasi" dengan klaim keuntungan fantastis dalam waktu singkat.
- Tekanan untuk "beli sekarang sebelum terlambat" — FOMO yang disengaja.
- Akun anonim yang tidak bisa diverifikasi identitasnya.

**Cara memverifikasi:**
1. Cek apakah ada berita resmi dari emiten di IDX (idx.co.id).
2. Lihat data volume dan harga historis — apakah ada lonjakan volume yang tidak wajar sebelum berita viral?
3. Cari analis atau sumber yang bisa diverifikasi identitas dan rekam jejaknya.
4. Kalau tidak bisa jelaskan kenapa harganya naik berdasarkan fundamental — jangan beli hanya karena viral.

**Prinsip:**
Jangan beli saham hanya karena viral. FOMO adalah salah satu penyebab kerugian terbesar investor ritel.

⚠️ Berinvestasi di saham gorengan sangat berisiko dan bisa mengakibatkan kerugian besar.`,
  },
  {
    level: 4,
    title: "Seasonal Patterns & Window Dressing",
    analogy:
      "Window dressing = fund manager 'berdandan' portofolio di akhir kuartal — bisa menciptakan pergerakan harga yang tidak mencerminkan fundamental.",
    contentMarkdown: `**Window Dressing:**
Di akhir kuartal (Maret, Juni, September, Desember), manajer investasi reksa dana dan institusi sering membeli saham-saham yang sudah naik (untuk menampilkan portofolio yang terlihat bagus di laporan ke nasabah) dan menjual saham-saham yang sudah turun (untuk menyembunyikan posisi rugi dari laporan).

Efek ini bisa menciptakan pergerakan harga artifisial:
- Saham "unggulan" naik menjelang akhir kuartal.
- Saham yang sudah turun bisa makin tertekan.

Setelah akhir kuartal, beberapa saham yang naik karena window dressing sering kembali turun.

**Year-End Effect:**
Pola historis di beberapa pasar menunjukkan kenaikan harga saham pada akhir Desember dan awal Januari — dikenal sebagai "January Effect". Sebagian terjadi karena investor menjual di akhir tahun untuk keperluan pajak, lalu membeli kembali di awal tahun.

**Cara menyikapnya:**
- Seasonal patterns adalah kecenderungan statistik, bukan kepastian — tidak selalu terjadi.
- Jangan membuat keputusan investasi besar semata-mata berdasarkan seasonal patterns.
- Gunakan sebagai informasi tambahan, bukan sinyal utama.

⚠️ Pola musiman di pasar Indonesia mungkin berbeda dengan pasar AS. Selalu verifikasi dengan data historis IDX, bukan asumsi dari pasar lain.`,
  },
  {
    level: 5,
    title: "Membedakan Sinyal vs Noise",
    analogy:
      "Di pasar saham, noise selalu lebih keras dari sinyal — tugas investor adalah menyaring.",
    contentMarkdown: `Setiap hari ada ratusan berita, analisis, rumor, dan opini tentang pasar saham. Sebagian besar adalah **noise** — informasi yang tidak relevan dengan keputusan investasi jangka panjangmu.

**Framework filter 3 pertanyaan:**

**1. Apakah ini dari sumber resmi?**
Sumber resmi = keterbukaan informasi IDX, laporan keuangan audited, rilis resmi emiten, peraturan OJK/BI. Kalau tidak, tingkat kredibilitasnya jauh lebih rendah.

**2. Apakah ini mengubah fundamental jangka panjang perusahaan?**
- Pergantian CEO → bisa penting, tergantung rekam jejak dan strategi baru.
- Kontrak baru besar → mungkin penting jika material terhadap revenue.
- Harga saham naik 5% hari ini → hampir pasti noise untuk investor jangka panjang.
- Perubahan kebijakan industri yang fundamental → penting dikaji.

**3. Apakah ada konfirmasi dari data lain?**
Satu berita yang tidak dikonfirmasi oleh data fundamental, laporan keuangan, atau analisis independen? Kemungkinan besar noise.

**Prinsip menyaring:**
- Tetapkan "filter" informasi sebelum mulai berinvestasi: sumber mana yang kamu percaya? Seberapa sering kamu akan cek portofolio?
- Semakin sering kamu cek harga, semakin besar kemungkinan kamu bereaksi terhadap noise.
- Keputusan investasi terbaik biasanya dibuat setelah analisis tenang, bukan saat euforia atau panik.

⚠️ Tidak ada filter yang sempurna. Yang penting adalah memiliki kerangka yang konsisten dan melatihnya terus-menerus.`,
  },
];
