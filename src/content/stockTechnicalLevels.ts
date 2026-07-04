/**
 * Akademi Analisis Saham → Kategori Analisis Teknikal, Level 1-5.
 *
 * Semua angka/harga adalah ILUSTRASI — bukan data pasar nyata.
 */

import { StockLessonSeed } from "./stockFundamentalLevels";

export const STOCK_TECHNICAL_LEVELS: StockLessonSeed[] = [
  {
    level: 1,
    title: "Membaca Grafik Candlestick",
    analogy:
      "Setiap lilin = satu hari (atau periode) perjalanan harga: buka, tertinggi, terendah, tutup.",
    contentMarkdown: `Candlestick (grafik lilin) menampilkan empat data harga dalam satu batang:

- **Open (O)** — harga pembukaan sesi.
- **High (H)** — harga tertinggi selama sesi.
- **Low (L)** — harga terendah selama sesi.
- **Close (C)** — harga penutupan sesi.

**Anatomi candlestick:**
- **Body (badan)** — kotak antara Open dan Close. Lebar body mencerminkan seberapa jauh harga bergerak dalam sesi.
- **Shadow / Wick (ekor)** — garis tipis di atas dan bawah body, menunjukkan rentang High-Low yang melampaui body.

**Bullish vs Bearish:**
- **Bullish candle** (biasanya hijau/putih) — Close lebih tinggi dari Open: harga naik di sesi ini.
- **Bearish candle** (biasanya merah/hitam) — Close lebih rendah dari Open: harga turun di sesi ini.

Bayangkan setiap candle seperti ringkasan satu ronde pertandingan tinju — siapa yang dominan (pembeli atau penjual) dan seberapa kuat pertarungannya.

⚠️ Semua angka di grafik nyata selalu berubah — jangan hafal angka, pahami bentuknya.`,
  },
  {
    level: 2,
    title: "Support & Resistance",
    analogy: "Support = lantai harga, resistance = atap harga.",
    contentMarkdown: `**Support** adalah level harga di mana tekanan beli cenderung cukup kuat untuk menghentikan penurunan harga — seperti lantai yang menahan bola jatuh.

**Resistance** adalah level harga di mana tekanan jual cenderung cukup kuat untuk menghentikan kenaikan harga — seperti atap yang menghalangi bola naik.

**Mengapa ini terjadi?**
Banyak trader melihat grafik yang sama dan memasang order beli/jual di level yang sama, sehingga reaksi harga di level itu menjadi "self-fulfilling" (terpenuhi sendiri) sampai batas tertentu.

**Contoh ilustrasi (BUKAN data nyata):**
Misalkan harga saham ILUSTRASI sudah 3 kali memantul dari harga Rp 1.000 (ILUSTRASI). Level Rp 1.000 itu bisa dianggap sebagai support — tapi ingat, support bisa jebol kalau ada berita fundamental yang buruk.

**Yang perlu diingat:**
- Support dan resistance bukan garis ajaib — harga bisa jebol kapan saja.
- Semakin sering harga memantul dari sebuah level, makin "kuat" level itu dianggap — tapi itu juga berarti makin besar dampaknya kalau akhirnya jebol.
- Setelah support jebol, ia sering berubah menjadi resistance baru (dan sebaliknya).

⚠️ Semua angka di atas adalah ILUSTRASI. Data harga nyata harus kamu ambil sendiri dari sumber resmi (IDX, Stockbit, RTI).`,
  },
  {
    level: 3,
    title: "Trend & Moving Average (MA)",
    analogy:
      "MA = rata-rata harga bergerak, seperti nilai rata-rata ulangan bulanan yang menghaluskan nilai harian yang naik-turun.",
    contentMarkdown: `**Tren harga** adalah arah dominan pergerakan harga dalam suatu periode:
- **Uptrend** — serangkaian Higher High (HH) dan Higher Low (HL) — harga secara umum naik.
- **Downtrend** — serangkaian Lower High (LH) dan Lower Low (LL) — harga secara umum turun.
- **Sideways** — harga bergerak dalam range sempit tanpa arah yang jelas.

**Moving Average (MA):**
MA menghitung rata-rata harga penutupan dalam N periode terakhir dan memplotnya sebagai garis. Karena menghitung rata-rata, garis MA lebih halus dari grafik harga asli — noise harian tersaring.

- **MA-20** (rata-rata 20 hari) — mencerminkan tren jangka pendek.
- **MA-50** (rata-rata 50 hari) — mencerminkan tren jangka menengah.

**Interpretasi umum:**
- Harga di atas MA-50 = tren jangka menengah cenderung naik.
- Harga di bawah MA-50 = tren jangka menengah cenderung turun.
- MA-20 memotong MA-50 dari bawah ke atas = sinyal potensi tren naik (tapi perlu konfirmasi).

⚠️ MA adalah indikator lagging (tertinggal) — ia merespons setelah harga bergerak, bukan sebelum. Jangan andalkan MA sendiri untuk keputusan beli/jual. Semua angka di sini ILUSTRASI.`,
  },
  {
    level: 4,
    title: "Volume & Konfirmasi Sinyal",
    analogy:
      "Volume = seberapa ramai transaksi — sinyal teknikal tanpa volume yang mendukung itu seperti gosip tanpa bukti.",
    contentMarkdown: `**Volume** adalah jumlah lembar saham yang berpindah tangan dalam suatu periode. Volume yang tinggi menunjukkan banyak pelaku pasar yang terlibat dalam pergerakan harga tersebut.

**Mengapa volume penting?**
Bayangkan harga bergerak naik tapi hanya sedikit orang yang bertransaksi — mungkin itu cuma pergerakan kecil yang tidak mencerminkan konsensus pasar. Sebaliknya, kalau harga naik disertai volume yang jauh di atas rata-rata, ada banyak peserta yang percaya pada kenaikan itu.

**Prinsip volume:**
1. **Breakout + volume tinggi** = sinyal lebih kuat. Kalau harga menembus resistance dengan volume besar, kemungkinan breakout itu valid lebih tinggi.
2. **Breakout + volume rendah** = sinyal lemah. Harga mungkin cepat berbalik arah (false breakout).
3. **Harga naik + volume turun** = sinyal waspada. Momentum mungkin melemah.

**Cara membaca:**
Bandingkan volume hari ini dengan rata-rata volume 20-30 hari sebelumnya (Average Volume). Kalau volume hari ini 2x rata-rata dan harga menembus resistance = konfirmasi lebih kuat.

⚠️ Volume juga bisa dimanipulasi dalam saham gorengan (low liquidity). Tetap kombinasikan dengan analisis fundamental. Semua angka ILUSTRASI.`,
  },
  {
    level: 5,
    title: "RSI & MACD: Indikator Momentum",
    analogy:
      "RSI = termometer overbought/oversold: di atas 70 = panas, di bawah 30 = dingin.",
    contentMarkdown: `**RSI (Relative Strength Index)**
RSI mengukur kecepatan dan besarnya perubahan harga dalam skala 0-100:
- **RSI > 70** — kondisi overbought: harga naik terlalu cepat, mungkin ada koreksi.
- **RSI < 30** — kondisi oversold: harga turun terlalu cepat, mungkin ada rebound.
- **RSI sekitar 50** — momentum netral.

Ingat: RSI > 70 tidak otomatis berarti "jual sekarang" — dalam tren naik yang kuat, RSI bisa bertahan di zona overbought lama.

**MACD (Moving Average Convergence Divergence)**
MACD terdiri dari dua elemen utama:
- **MACD Line** — selisih MA-12 dan MA-26.
- **Signal Line** — MA-9 dari MACD Line.

**Interpretasi dasar:**
- MACD Line memotong Signal Line dari bawah ke atas = potensi sinyal bullish.
- MACD Line memotong Signal Line dari atas ke bawah = potensi sinyal bearish.
- Histogram (batang) menunjukkan jarak antara kedua garis — semakin besar, semakin kuat momentum.

**Penting:**
Indikator teknikal adalah alat bantu, bukan ramalan. RSI dan MACD sering memberikan sinyal palsu, terutama di pasar yang bergerak sideways. Selalu verifikasi dengan konteks fundamental emiten dan kondisi pasar secara keseluruhan.

⚠️ Semua contoh angka di atas ILUSTRASI. Jangan gunakan sinyal teknikal tanpa memahami bisnis di balik saham tersebut.`,
  },
];
