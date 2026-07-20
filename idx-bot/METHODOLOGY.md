# METODOLOGI — Bot Analisa Saham IDX (Fase 1)

Dokumen ini adalah salinan formula & parameter eksplisit yang dipakai di kode,
sesuai kewajiban §11 prompt master ("Dokumentasi metodologi... isi dari §4–§7
disalin ke dokumentasi produk"). Kalau kode dan dokumen ini berbeda, kode yang
jadi acuan — laporkan sebagai bug dokumentasi.

Scope Fase 1 **tidak termasuk** sistem skoring gabungan berbobot (§7 prompt
master) dan berita otomatis (§6.1) — keduanya ditunda ke Fase 2 sesuai
RENCANA EKSEKUSI. Semua indikator di bawah ditampilkan apa adanya per
komponen, bukan sebagai satu sinyal hijau/merah/kuning gabungan.

---

## 1. Moving Average — `indicators/moving_average.py`

- SMA dan EMA dihitung untuk periode **20, 50, 100, 200** hari bursa.
- EMA memakai `pandas.Series.ewm(span=periode, adjust=False)` — smoothing
  eksponensial standar berbasis span, dihitung dari seluruh histori data yang
  tersedia (bukan hanya window terakhir).
- **Golden Cross**: MA50 memotong ke atas MA200. **Death Cross**: MA50
  memotong ke bawah MA200. Dideteksi dari perubahan tanda `MA50 - MA200`
  sepanjang histori; hanya cross yang terjadi setelah MA200 punya cukup data
  (≥200 hari) yang bisa terdeteksi — cross yang secara matematis terjadi
  sebelum hari ke-200 tidak bisa dibuktikan dari data yang ada, jadi tidak
  diklaim.
- Trend jangka pendek: `Uptrend` jika harga > MA20 > MA50 DAN MA20 naik
  dibanding 5 hari sebelumnya. `Downtrend` kebalikannya. Selain itu
  `Sideways`. Butuh minimal 55 hari data.
- Kalau histori data kurang dari periode yang diminta → field itu
  `"tersedia": false` dengan alasan eksplisit, bukan dihitung parsial.

## 2. RSI — `indicators/rsi.py`

- Periode default **14**.
- **Varian formula**: rata-rata sederhana (SMA) atas gain/loss per hari
  dalam window (dikenal sebagai "Cutler's RSI"), **bukan** smoothing
  eksponensial Wilder asli. Dipilih supaya bisa diverifikasi manual persis
  lewat unit test (`tests/test_rsi.py`) — nilainya bisa sedikit berbeda dari
  platform lain yang pakai Wilder's smoothing, tapi interpretasi
  overbought/oversold sama.
- Overbought: RSI > 70. Oversold: RSI < 30. Selain itu Netral.
- Butuh minimal 15 hari data (periode + 1).

## 3. ADX — `indicators/adx.py`

- Periode default **14**.
- **Varian formula**: smoothing SMA (bukan Wilder) untuk +DM/-DM/TR dan DX,
  dengan alasan yang sama seperti RSI di atas.
- ADX < 20: Lemah/Sideways. 20–25: Transisi. > 25: Kuat.
- Arah: `+DI > -DI` → Bullish, sebaliknya Bearish.
- Butuh minimal `2 × periode` (28) hari data karena smoothing ganda (TR/DM
  lalu DX).

## 4. Volume — `indicators/volume.py`

- Rata-rata volume **20 hari** (rolling, termasuk hari berjalan).
- Volume spike: volume hari ini ≥ **1.5×** rata-rata 20 hari.
- Konfirmasi: harga naik + volume di atas rata-rata → "uptrend terkonfirmasi".
  Harga naik + volume di bawah rata-rata → "divergence, potensi trend
  lemah". Simetris untuk arah turun.

## 5. Fibonacci — `indicators/fibonacci.py`

- Lookback **60–90 hari bursa** (default 90; window aktual dilaporkan di
  output, minimal 60 hari data untuk bisa dihitung sama sekali).
- Swing high/low = nilai High/Low tertinggi/terendah dalam window lookback.
- Retracement: **23.6%, 38.2%, 50%, 61.8%, 78.6%**. Extension: **127.2%,
  161.8%**.
- Arah ditentukan dari urutan tanggal swing low vs swing high: kalau swing
  low terjadi lebih dulu → uptrend leg (retracement dihitung turun dari
  swing high). Kalau swing high lebih dulu → downtrend leg (retracement
  dihitung naik dari swing low).
- Level terdekat dengan harga saat ini dilaporkan eksplisit.

## 6. Support/Resistance — `indicators/support_resistance.py`

- **Metode: fractal** (swing high/low berulang), bukan pivot point klasik.
  Alasan: fractal mendeteksi level dari swing harga historis aktual pada
  lookback jangka menengah — lebih relevan untuk gaya analisis bot ini
  dibanding pivot point yang hanya berbasis OHLC hari sebelumnya, dan lebih
  mudah diuji dengan data sintetis yang bentuknya diketahui persis.
- Sebuah bar dianggap swing high/low jika High/Low-nya adalah nilai
  ekstrem **unik** dalam window ±5 bar di sekitarnya (parameter
  `fractal_window`, default 5).
- Output: maksimal 2 level support (di bawah harga, "target beli") dan 2
  level resistance (di atas harga, "target jual") terdekat dari harga
  sekarang. Kalau ditemukan kurang dari 2, tetap ditampilkan apa adanya
  dengan catatan eksplisit.

## 7. Candlestick — `indicators/candlestick.py`

Semua pola dideteksi dengan aturan numerik eksplisit atas rasio body/wick,
bukan deskripsi visual samar:

| Pola | Aturan |
|---|---|
| Doji | body ≤ 10% dari range (High−Low) |
| Hammer | lower wick ≥ 2× body DAN upper wick ≤ 30% body |
| Shooting Star | upper wick ≥ 2× body DAN lower wick ≤ 30% body |
| Bullish Engulfing | candle sebelumnya bearish, candle sekarang bullish, body sekarang mencakup penuh body sebelumnya |
| Bearish Engulfing | kebalikan Bullish Engulfing |
| Morning Star | candle 1 bearish besar, candle 2 body ≤ 50% candle 1, candle 3 bullish dan close di atas titik tengah body candle 1 |
| Evening Star | kebalikan Morning Star |

Semua pola melaporkan tanggal candle dan harga close terkait.

## 8. Fundamental — `data/fundamental.py`

| Metrik | Formula |
|---|---|
| PER | Harga saham ÷ EPS (trailing twelve months) |
| PBV | Harga saham ÷ Book Value per Share |
| Market Cap | Harga saham × jumlah saham beredar |

Setiap metrik dievaluasi **terpisah** — kalau EPS tidak tersedia/nol, hanya
PER yang ditandai tidak tersedia, PBV/Market Cap tetap dihitung kalau
datanya ada. Tanggal laporan keuangan diambil dari field `mostRecentQuarter`
sumber data kalau tersedia; kalau tidak, ditandai eksplisit "tanggal laporan
tidak tersedia dari sumber data" — angka tetap ditampilkan tapi tanpa
klaim tanggal acuan resmi (lebih jujur daripada mengarang tanggal).

## 9. Estimasi Akumulasi/Distribusi — `indicators/bandarmology.py`

**BUKAN bandarmology sejati** (bukan data broker summary/foreign flow —
lihat keputusan Fase 0). Proksi berbasis volume + price action:

1. Ambil 20 hari bursa terakhir (`lookback_days`, dikonfigurasi).
2. Hitung rata-rata volume window tersebut.
3. "Hari akumulasi" = close naik dari hari sebelumnya DAN volume di atas
   rata-rata window. "Hari distribusi" = kebalikannya.
4. Selisih (akumulasi − distribusi) ≥ 3 → **Estimasi Akumulasi**. ≤ −3 →
   **Estimasi Distribusi**. Di antaranya → **Netral/Campur**.

Label `"ESTIMASI"` WAJIB tampil setiap kali status ini ditampilkan ke
pengguna (lihat `bot/formatter.py`) — tidak pernah diklaim sebagai data
broker asli.
