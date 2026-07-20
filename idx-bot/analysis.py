"""Orkestrasi: gabungkan fetch data + semua indikator jadi satu hasil analisis per saham.

Dipanggil oleh scheduler/daily_update.py (dijalankan sekali per hari) — BUKAN
dipanggil langsung tiap kali ada perintah Discord (lihat storage/db.py).
"""

from datetime import datetime

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover
    ZoneInfo = None

from config import TIMEZONE
from data.fetch import fetch_fundamental, fetch_ohlcv
from data.fundamental import compute_fundamental
from indicators.adx import compute_adx
from indicators.bandarmology import estimasi_akumulasi_distribusi
from indicators.candlestick import detect_candlestick_patterns
from indicators.fibonacci import compute_fibonacci
from indicators.moving_average import compute_moving_averages
from indicators.rsi import compute_rsi
from indicators.support_resistance import compute_support_resistance
from indicators.volume import compute_volume_signal


def _now_wib_str() -> str:
    if ZoneInfo is not None:
        now = datetime.now(ZoneInfo(TIMEZONE))
    else:  # pragma: no cover
        now = datetime.now()
    return now.strftime("%d %b %Y, %H:%M WIB")


def analyze_ticker(kode_saham: str) -> dict:
    kode_saham = kode_saham.upper()
    ohlcv = fetch_ohlcv(kode_saham)
    if not ohlcv["tersedia"]:
        return {
            "ticker": kode_saham,
            "tersedia": False,
            "alasan": ohlcv["alasan"],
            "dihitung_pada": _now_wib_str(),
        }

    df = ohlcv["data"]
    harga_terkini = float(df["Close"].iloc[-1])
    tanggal_data_terakhir = str(df.index[-1].date())

    fundamental_raw = fetch_fundamental(kode_saham, harga_terkini)
    if fundamental_raw["tersedia"]:
        fundamental = compute_fundamental(
            eps=fundamental_raw.get("eps"),
            bvps=fundamental_raw.get("bvps"),
            shares_outstanding=fundamental_raw.get("shares_outstanding"),
            harga_terkini=harga_terkini,
            tanggal_laporan=fundamental_raw.get("tanggal_laporan"),
            tanggal_laporan_catatan=fundamental_raw.get("tanggal_laporan_catatan"),
        )
        fundamental["tersedia"] = True
        fundamental["sumber"] = fundamental_raw["sumber"]
        fundamental["diambil_pada"] = fundamental_raw["diambil_pada"]
        fundamental["nama_perusahaan"] = fundamental_raw.get("nama_perusahaan")
    else:
        fundamental = {"tersedia": False, "alasan": fundamental_raw["alasan"]}

    return {
        "ticker": kode_saham,
        "tersedia": True,
        "dihitung_pada": _now_wib_str(),
        "harga_terkini": harga_terkini,
        "sumber_harga": ohlcv["sumber"],
        "harga_diambil_pada": ohlcv["diambil_pada"],
        "tanggal_data_terakhir": tanggal_data_terakhir,
        "rentang_data": ohlcv["rentang_tanggal"],
        "jumlah_bar": ohlcv["jumlah_bar"],
        "moving_average": compute_moving_averages(df),
        "rsi": compute_rsi(df),
        "adx": compute_adx(df),
        "volume": compute_volume_signal(df),
        "fibonacci": compute_fibonacci(df),
        "support_resistance": compute_support_resistance(df),
        "candlestick": detect_candlestick_patterns(df),
        "bandarmology": estimasi_akumulasi_distribusi(df),
        "fundamental": fundamental,
    }
