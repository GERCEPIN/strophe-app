# Bot Analisa Saham IDX — Fase 1 (MVP)

Bot Discord yang menganalisis saham IDX dari watchlist custom memakai 7
indikator teknikal + fundamental dasar + estimasi akumulasi/distribusi
berbasis volume. Dibangun mengikuti `prompt-bot-analisa-saham-idx.md`
(aturan & spesifikasi) dan `rencana-eksekusi-bot-analisa-saham-idx.md`
(urutan fase) yang menjadi acuan proyek ini.

Proyek ini **berdiri sendiri** — Python + Discord bot, terpisah total dari
aplikasi web STROPHE di root repo ini (`../src`). Tidak ada kode yang
dibagi antara keduanya.

## ⚠️ Status Verifikasi Sumber Data — WAJIB DIBACA SEBELUM DEPLOY

Kode ini ditulis di sandbox development yang **egress network-nya
diblokir kebijakan organisasi** (termasuk ke Yahoo Finance, Google, dan
httpbin — dicoba dan dikonfirmasi 403 di semua host, bukan cuma Yahoo).
Akibatnya:

- Layer fetch data (`data/fetch.py`, pakai `yfinance`) mengikuti API resmi
  yfinance yang terdokumentasi, **tapi belum pernah dites terhadap Yahoo
  Finance sungguhan** dari sesi pengembangan ini.
- Semua 69 unit test yang menyertai proyek ini **lulus penuh**, tapi
  memakai data OHLCV sintetis buatan sendiri (lihat `tests/conftest.py`) —
  bukan panggilan API live.
- Ini melanggar syarat §3 prompt master ("sumber data wajib dikonfirmasi
  tersedia sebelum coding selesai") secara jujur harus diakui, bukan
  ditutup-tutupi.

**Sebelum Fase 1 dianggap benar-benar selesai**, jalankan ini di mesin
dengan akses internet normal:

```bash
python3 -c "
import yfinance as yf
t = yf.Ticker('BBCA.JK')
print(t.history(period='1mo').tail())
print(t.info.get('trailingEps'), t.info.get('bookValue'), t.info.get('sharesOutstanding'))
"
```

Kalau ini mengembalikan data asli (bukan error/kosong), sumber data
terverifikasi dan checklist Definition of Done bisa dicentang jujur. Kalau
gagal atau datanya kosong untuk beberapa saham di watchlist (lihat di
bawah, terutama saham-saham kecil/tidak likuid), catat di sini dan
sesuaikan — arsitektur sudah didesain supaya kegagalan per-saham tidak
merusak saham lain (`"tersedia": false` per saham, bukan crash total).

## Keputusan Fase 0 (sudah diputuskan, jangan diubah tanpa alasan kuat)

| Keputusan | Pilihan |
|---|---|
| Sumber bandarmology | **(b) Estimasi berbasis volume**, dilabeli `ESTIMASI` di semua output — data broker asli tidak dipakai |
| Platform | **Discord bot** (bukan Telegram — beda dari rekomendasi default dokumen, sesuai pilihan pemilik proyek) |
| Watchlist awal | 30 kode saham custom, lihat `config.py` |
| Budget | **Rp0** — semua sumber data & hosting harus free-tier |

## Sumber Data

| Data | Sumber | Biaya | Rate limit | Keandalan | Metode | Status ToS |
|---|---|---|---|---|---|---|
| OHLCV harian (`.JK`) | Yahoo Finance via `yfinance` | Gratis | Tidak dipublikasikan resmi — pakai jeda antar-request wajar, jangan scan >30 ticker per menit | End-of-Day, delay tidak dijamin real-time | API tidak resmi (undocumented, dipakai luas oleh komunitas) | **Abu-abu** — yfinance mengakses endpoint internal Yahoo yang tidak didokumentasikan untuk pemakaian publik/komersial. Cukup untuk pemakaian pribadi non-komersial seperti proyek ini, tapi TIDAK boleh diasumsikan aman untuk skala besar/komersial tanpa tinjauan ulang ToS Yahoo. |
| Fundamental (EPS/BVPS/saham beredar) | Yahoo Finance via `yfinance` (`.info`) | Gratis | Sama seperti di atas | Sering kosong/`None` untuk saham small-cap IDX — bot menangani ini dengan "Data tidak tersedia" per metrik, bukan crash | Sama seperti di atas | Sama seperti di atas |
| Bandarmology (broker summary/foreign flow asli) | **Tidak dipakai di Fase 1** | – | – | – | – | Diputuskan skip di Fase 0, diganti estimasi volume |
| Berita | **Tidak dipakai di Fase 1** (di luar scope, lihat RENCANA EKSEKUSI) | – | – | – | – | – |

Kalau yfinance/Yahoo berhenti bisa diakses atau berubah kebijakan di masa
depan, ganti implementasi di `data/fetch.py` saja — semua kode di atasnya
(indikator, formatter, bot) tidak perlu berubah karena mereka hanya
menerima DataFrame OHLCV standar, bukan spesifik ke yfinance.

## Setup

```bash
cd idx-bot
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# isi DISCORD_BOT_TOKEN di .env — buat bot & ambil token di https://discord.com/developers/applications
# saat invite bot ke server, aktifkan scope "applications.commands" supaya slash command muncul
```

## Menjalankan

```bash
python3 main.py                 # bot Discord + scheduler update harian (Senin-Jumat, ~16:15 WIB)
python3 main.py --update-now    # jalankan update sekali secara manual (tanpa start bot)
```

Command yang tersedia di Discord setelah bot online:
- `/analisa KODE` — analisis lengkap satu saham dari watchlist (baca dari cache, tidak menghitung ulang saat itu juga)
- `/watchlist` — ringkasan semua saham di watchlist beserta RSI & status estimasi akumulasi/distribusi

Kalau `/analisa` menjawab "belum ada data ter-cache", jalankan
`python3 main.py --update-now` dulu supaya cache terisi.

## Mengubah Watchlist

Edit `WATCHLIST` di `config.py`. Format kode saham tanpa suffix `.JK`
(suffix ditambah otomatis). Setelah diubah, jalankan
`python3 main.py --update-now` supaya cache ikut ter-update.

## Testing

```bash
pip install -r requirements.txt   # pytest sudah termasuk
pytest -v
```

69 test mencakup: hitungan manual/independen tiap indikator teknikal
(§10.1 prompt master), integritas data OHLCV — harga negatif/nol, High<Low,
gap tanggal mencurigakan, data stale (§10.2), edge case histori data pendek
(<200 hari, saham baru IPO), orkestrasi analisis end-to-end dengan data
di-mock, cache SQLite, dan formatter output Discord. Semua data test
sintetis/mock — lihat peringatan verifikasi live di atas.

Test backtest sinyal gabungan (§10.3) **belum ada** karena sistem skoring
gabungan itu sendiri di luar scope Fase 1 (lihat RENCANA EKSEKUSI § Fase 2).

## Deploy 24 Jam (opsional, di luar scope kerja yang sudah dilakukan)

Supaya bot jalan terus tanpa laptop/HP menyala, deploy ke layanan yang
punya free tier untuk proses long-running + scheduler ringan — contoh yang
lazim dipakai: Railway, Render, Fly.io, PythonAnywhere. **Harga dan syarat
free tier provider-provider ini TIDAK dicek di sesi pengerjaan ini**
(sandbox tidak punya akses internet ke situs manapun, lihat peringatan di
atas) — cek langsung halaman pricing resmi masing-masing sebelum memilih,
kebijakan free tier sering berubah.

## Struktur Proyek

```
idx-bot/
├── config.py              # watchlist, parameter indikator, jadwal update
├── main.py                 # entrypoint
├── analysis.py              # orkestrasi: fetch + semua indikator -> satu hasil
├── data/
│   ├── fetch.py              # wrapper yfinance (OHLCV + fundamental)
│   ├── fundamental.py        # kalkulasi PER/PBV/Market Cap
│   └── integrity.py          # validasi data OHLCV mentah
├── indicators/               # 7 indikator teknikal + estimasi bandarmology, semua pure function
├── storage/db.py             # cache SQLite (hasil terbaru per saham)
├── scheduler/daily_update.py # job harian + registrasi APScheduler
├── bot/
│   ├── formatter.py           # hasil analisis -> teks (tidak bergantung discord.py, mudah dites)
│   └── discord_bot.py         # slash command /analisa & /watchlist
└── tests/                    # 69 unit test, pytest
```

## Metodologi Lengkap

Formula & parameter eksplisit tiap indikator ada di `METHODOLOGY.md`
(salinan §4–§7 prompt master + implementasinya).

## Disclaimer

⚠️ Bot ini adalah alat bantu analisis, bukan rekomendasi/nasihat investasi.
Keputusan investasi sepenuhnya tanggung jawab pengguna. Selalu lakukan
riset mandiri (DYOR). Status "Estimasi Akumulasi/Distribusi" adalah proksi
berbasis volume, BUKAN data broker summary/foreign flow sungguhan.

## Changelog

- **2026-07-20** — Fase 1 (MVP) pertama: 7 indikator teknikal, fundamental
  dasar (PER/PBV/Market Cap), estimasi akumulasi/distribusi berbasis
  volume, cache SQLite, scheduler harian, bot Discord (`/analisa`,
  `/watchlist`), 69 unit test. Sumber data OHLCV/fundamental (yfinance)
  belum diverifikasi live — lihat bagian "Status Verifikasi Sumber Data".
