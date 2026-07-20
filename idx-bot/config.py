"""Konfigurasi statis Bot Analisa Saham IDX — Fase 1.

Ubah WATCHLIST untuk menambah/mengurangi saham yang dipantau.
"""

# Kode saham IDX (tanpa suffix ".JK" — suffix ditambahkan otomatis di data/fetch.py)
WATCHLIST = [
    "COCO", "BULL", "BIPI", "DEWA", "MDKA", "SSIA", "TPIA", "BNBR", "MDIA",
    "SIMP", "APLN", "BUVA", "RAJA", "VKTR", "ENRG", "SOCI", "GOLF", "HUMI",
    "MINA", "PSKT", "ADMR", "BRMS", "WIFI", "LEAD", "FOLK", "OASA", "KPIG",
    "ASRI", "INAI", "KIJA",
]

TIMEZONE = "Asia/Jakarta"

# Jadwal update harian: setelah bursa IDX tutup (~16:00 WIB) + buffer settlement data.
DAILY_UPDATE_HOUR_WIB = 16
DAILY_UPDATE_MINUTE_WIB = 15

# --- Parameter indikator (§4 prompt master) ---
MA_PERIODS = [20, 50, 100, 200]
MA_SLOPE_LOOKBACK_DAYS = 5

RSI_PERIOD = 14
RSI_OVERBOUGHT = 70
RSI_OVERSOLD = 30

ADX_PERIOD = 14
ADX_WEAK_TREND_MAX = 20
ADX_STRONG_TREND_MIN = 25

VOLUME_AVG_WINDOW = 20
VOLUME_SPIKE_MULTIPLIER = 1.5

FIBONACCI_LOOKBACK_DAYS = 90  # dalam rentang 60-90 hari bursa sesuai §4.5
FIBONACCI_RETRACEMENT_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.786]
FIBONACCI_EXTENSION_LEVELS = [1.272, 1.618]

# Support/Resistance: metode fractal (swing high/low berulang), lihat METHODOLOGY.md §4.6
SR_FRACTAL_WINDOW = 5  # jumlah bar di tiap sisi untuk deteksi swing point
SR_MIN_LEVELS = 2

# Bandarmology estimasi (§6.2) — proksi volume + price action, BUKAN data broker asli
BANDARMOLOGY_LOOKBACK_DAYS = 20

# Minimum bar historis agar MA200 bisa dihitung
MIN_BARS_FOR_MA200 = 200

DATA_SOURCE_OHLCV = "Yahoo Finance (yfinance, ticker .JK)"
DATA_SOURCE_FUNDAMENTAL = "Yahoo Finance (yfinance .info)"

DISCLAIMER = (
    "⚠️ Ini adalah alat bantu analisis, bukan rekomendasi/nasihat investasi. "
    "Keputusan investasi sepenuhnya tanggung jawab pengguna. Selalu lakukan riset mandiri (DYOR)."
)
