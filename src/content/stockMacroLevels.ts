/**
 * Akademi Analisis Saham → Kategori Makro-Sektoral, Level 1-5.
 *
 * Semua angka/persentase adalah ILUSTRASI — bukan data ekonomi nyata.
 */

import { StockLessonSeed } from "./stockFundamentalLevels";

export const STOCK_MACRO_LEVELS: StockLessonSeed[] = [
  {
    level: 1,
    title: "Siklus Ekonomi & Pasar Saham",
    analogy:
      "Ekonomi seperti musim: ekspansi, puncak, kontraksi, dasar — saham bereaksi berbeda di tiap musim.",
    contentMarkdown: `Ekonomi bergerak dalam siklus yang berulang dengan empat fase utama:

**1. Ekspansi (musim semi/panas)**
Pertumbuhan ekonomi positif, konsumsi naik, perusahaan mencatat laba meningkat. Saham sektor siklikal (properti, otomotif, barang mewah) cenderung outperform.

**2. Puncak (peak)**
Ekonomi tumbuh maksimal, inflasi mulai naik, bank sentral biasanya mulai menaikkan suku bunga untuk mendinginkan. Valuasi saham bisa mulai mahal.

**3. Kontraksi / Resesi**
Pertumbuhan melambat atau negatif, konsumsi turun, laba perusahaan tertekan. Saham sektor defensif (consumer staples, healthcare, utilitas) cenderung lebih tahan.

**4. Dasar (trough)**
Titik terendah siklus. Biasanya jadi kesempatan akumulasi saham untuk investor jangka panjang yang disiplin — tapi menentukan kapan tepatnya "dasar" sangat sulit.

**Pelajaran utama:**
Tidak ada yang bisa menentukan timing siklus dengan tepat. Pemahaman siklus berguna untuk menghindari membeli di puncak euforia atau menjual panik di dasar krisis — bukan untuk spekulasi jangka pendek.

⚠️ Semua contoh angka ILUSTRASI. Kondisi ekonomi nyata selalu lebih kompleks dari model empat fase ini.`,
  },
  {
    level: 2,
    title: "Inflasi, Suku Bunga & Saham",
    analogy:
      "Suku bunga naik = biaya pinjaman naik = perusahaan butuh untung lebih besar = valuasi saham cenderung turun (discounted future earnings).",
    contentMarkdown: `**Hubungan suku bunga dan valuasi saham:**

Nilai saham bisa dianggap sebagai "nilai sekarang" dari aliran keuntungan masa depan. Rumus sederhana: semakin tinggi suku bunga, semakin besar "diskon" yang diterapkan pada keuntungan masa depan — sehingga nilai saham hari ini cenderung lebih rendah.

**Dampak inflasi dan kenaikan suku bunga BI Rate / Fed Rate:**
- Biaya pinjaman perusahaan naik → margin laba bisa tertekan.
- Deposito & obligasi menjadi lebih menarik → sebagian investor mengalihkan dana dari saham ke instrumen bunga tetap.
- Saham pertumbuhan (growth stocks) dengan valuasi tinggi biasanya lebih sensitif terhadap kenaikan suku bunga.
- Saham nilai (value stocks) dan sektor keuangan (bank) kadang lebih tahan atau bahkan diuntungkan oleh kenaikan suku bunga.

**Yang perlu dipantau:**
- Rapat BI (Bank Indonesia) tiap bulan — keputusan BI Rate.
- Rapat FOMC (The Fed, AS) — keputusan Fed Funds Rate.
- Data inflasi CPI (Consumer Price Index) Indonesia dan AS.

**Ingat:**
Pasar saham sering bereaksi terhadap ekspektasi perubahan suku bunga, bukan hanya perubahan yang sudah terjadi.

⚠️ Semua angka dan persentase di sini ILUSTRASI.`,
  },
  {
    level: 3,
    title: "Analisis Sektoral: Memilih Industri yang Tepat",
    analogy:
      "Sebelum pilih ikan, pilih dulu kolamnya.",
    contentMarkdown: `Memilih saham yang bagus di industri yang sedang turun struktural jauh lebih sulit daripada memilih saham biasa di industri yang sedang tumbuh pesat.

**Sektor defensif:**
Permintaannya relatif stabil apapun kondisi ekonomi karena menyangkut kebutuhan dasar:
- Consumer staples (makanan & minuman pokok, produk rumah tangga)
- Healthcare (farmasi, rumah sakit)
- Utilitas (listrik, air)

*Ciri: relatif stabil, tapi pertumbuhannya terbatas.*

**Sektor siklikal:**
Kinerja sangat bergantung pada siklus ekonomi:
- Properti & konstruksi
- Otomotif
- Pariwisata & hospitality
- Komoditas

*Ciri: bisa naik sangat tinggi di fase ekspansi, tapi bisa turun tajam di kontraksi.*

**Rotasi sektoral:**
Konsep bahwa investor secara kolektif berpindah dari satu sektor ke sektor lain seiring berjalannya siklus ekonomi. Misalnya, menjelang resesi, dana berpindah dari sektor siklikal ke defensif.

**Cara riset sektoral:**
1. Lihat pertumbuhan industri secara keseluruhan (laporan asosiasi, data BPS, laporan analis).
2. Bandingkan margin dan ROE rata-rata antar perusahaan di sektor yang sama.
3. Pertimbangkan regulasi pemerintah yang berlaku di sektor tersebut.

⚠️ Semua contoh ILUSTRASI. Data riil harus dicari dari sumber resmi.`,
  },
  {
    level: 4,
    title: "Faktor Global: Kurs, Komoditas & Geopolitik",
    analogy:
      "Kurs rupiah = nilai beli produk impor & bahan baku — naik turunnya langsung mempengaruhi margin perusahaan.",
    contentMarkdown: `**Kurs USD/IDR:**
- Rupiah melemah (misalnya dari Rp 15.000 ke Rp 16.000 per USD — ILUSTRASI) → biaya impor bahan baku naik → margin perusahaan yang bergantung bahan baku impor tertekan.
- Sebaliknya, eksportir yang menjual dalam USD diuntungkan karena pendapatan rupiah mereka naik.

**Perusahaan yang sensitif terhadap kurs:**
- Importir bahan baku (makanan, kimia, elektronik) — rugi kalau rupiah melemah.
- Eksportir komoditas (CPO, batubara, karet) — untung kalau rupiah melemah.
- Perusahaan dengan utang valas besar — beban meningkat kalau rupiah melemah.

**Harga komoditas global:**
- Harga minyak naik → biaya transportasi & energi naik → berdampak ke banyak sektor.
- Harga CPO naik → baik untuk emiten perkebunan sawit Indonesia.
- Harga batubara → berdampak pada emiten pertambangan dan listrik.

**Risiko geopolitik:**
Ketegangan antarnegara (perang dagang, sanksi, konflik) bisa mengganggu rantai pasok global dan mempengaruhi harga komoditas serta kepercayaan investor asing.

**Cara memantau:**
- Kurs USD/IDR: BI, Bloomberg.
- Harga komoditas global: CME Group, indexmundi.
- Sentimen investor asing di BEI: data net buy/sell asing di IDX.

⚠️ Semua angka ILUSTRASI. Kondisi global selalu berubah — pantau dari sumber data terkini.`,
  },
  {
    level: 5,
    title: "Membaca Data Makro: GDP, PMI, Current Account",
    analogy:
      "GDP growth = ukuran kesehatan ekonomi secara keseluruhan — seperti nilai rapor negara.",
    contentMarkdown: `**GDP (Gross Domestic Product):**
- GDP growth mengukur pertumbuhan total output ekonomi suatu negara dalam satu periode.
- Di Indonesia, BPS merilis data GDP setiap kuartal.
- GDP growth positif = ekonomi tumbuh; negatif dua kuartal berturut = resesi teknis.

*Contoh ilustrasi: GDP tumbuh X% (ILUSTRASI) yoy di Q2 — ini bukan angka nyata, hanya contoh cara membaca.*

**PMI (Purchasing Managers' Index):**
- Survei bulanan terhadap manajer pembelian di sektor manufaktur (dan jasa).
- PMI > 50 = ekspansi (lebih banyak yang memesan/memproduksi lebih dari bulan lalu).
- PMI < 50 = kontraksi.
- PMI berguna karena rilis lebih cepat dari data GDP, sehingga bisa jadi indikator awal.

**Current Account (Neraca Transaksi Berjalan):**
- Surplus current account = negara menerima lebih banyak devisa dari ekspor & jasa daripada yang dikeluarkan → cenderung mendukung nilai tukar.
- Defisit current account = negara mengeluarkan lebih banyak devisa → bisa menekan nilai tukar rupiah.

**Cara menggunakan data makro:**
Data makro memberikan konteks latar belakang, bukan sinyal beli/jual langsung. Gunakan untuk menilai: "Apakah lingkungan ekonomi saat ini mendukung atau menghambat bisnis sektor/emiten yang sedang kamu analisis?"

⚠️ Semua angka ILUSTRASI. Data makro resmi Indonesia tersedia di BPS (bps.go.id) dan BI (bi.go.id).`,
  },
];
