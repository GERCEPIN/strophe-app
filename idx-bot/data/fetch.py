"""Layer pengambilan data eksternal (yfinance) — OHLCV & fundamental.

PENTING — belum diverifikasi live: environment pengembangan yang dipakai untuk
menulis modul ini tidak memiliki akses internet keluar (diblokir kebijakan
sandbox), sehingga panggilan yfinance di bawah ini TIDAK PERNAH dites terhadap
API Yahoo Finance yang sesungguhnya. Formatnya mengikuti dokumentasi resmi
yfinance (ticker `.JK` untuk IDX, `.history()` untuk OHLCV, `.info` untuk
data fundamental), tapi WAJIB dites ulang dengan koneksi internet nyata
sebelum Fase 1 dianggap selesai — lihat README.md bagian "Status Verifikasi
Sumber Data".
"""

from datetime import datetime

import pandas as pd

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover
    ZoneInfo = None

import yfinance as yf

from config import DATA_SOURCE_FUNDAMENTAL, DATA_SOURCE_OHLCV, TIMEZONE
from data.integrity import check_ohlcv_integrity

TICKER_SUFFIX = ".JK"


def _now_wib_str() -> str:
    if ZoneInfo is not None:
        now = datetime.now(ZoneInfo(TIMEZONE))
    else:  # pragma: no cover
        now = datetime.now()
    return now.strftime("%d %b %Y, %H:%M WIB")


def fetch_ohlcv(kode_saham: str, period: str = "2y") -> dict:
    """Ambil histori OHLCV harian untuk satu kode saham IDX.

    Return dict selalu punya key "tersedia". Jika False, "alasan" berisi
    penjelasan kegagalan yang bisa ditampilkan langsung ke pengguna — tidak
    pernah raise exception ke pemanggil, dan tidak pernah mengembalikan data
    parsial tanpa peringatan.
    """
    ticker_code = f"{kode_saham.upper()}{TICKER_SUFFIX}"
    try:
        ticker = yf.Ticker(ticker_code)
        hist = ticker.history(period=period)
    except Exception as exc:  # noqa: BLE001 — sumber eksternal, semua error harus tertangkap & dilaporkan
        return {
            "tersedia": False,
            "alasan": f"gagal mengambil data dari {DATA_SOURCE_OHLCV} untuk {ticker_code}: {exc}",
        }

    if hist is None or hist.empty:
        return {
            "tersedia": False,
            "alasan": (
                f"tidak ada data OHLCV untuk {ticker_code} dari {DATA_SOURCE_OHLCV} "
                "(kemungkinan kode saham salah, saham baru IPO dengan histori terlalu pendek, "
                "atau saham delisted/suspend)"
            ),
        }

    hist = hist[["Open", "High", "Low", "Close", "Volume"]].copy()
    if hist.index.tz is not None:
        hist.index = hist.index.tz_localize(None)

    integrity = check_ohlcv_integrity(hist)
    if not integrity["valid"]:
        return {
            "tersedia": False,
            "alasan": f"data dari {DATA_SOURCE_OHLCV} untuk {ticker_code} gagal validasi integritas: "
            + "; ".join(integrity["issues"]),
        }

    return {
        "tersedia": True,
        "data": hist,
        "sumber": DATA_SOURCE_OHLCV,
        "diambil_pada": _now_wib_str(),
        "rentang_tanggal": (str(pd.Timestamp(hist.index[0]).date()), str(pd.Timestamp(hist.index[-1]).date())),
        "jumlah_bar": len(hist),
    }


def fetch_fundamental(kode_saham: str, harga_terkini: float | None) -> dict:
    """Ambil EPS, BVPS, dan jumlah saham beredar, lalu serahkan penghitungan
    PER/PBV/Market Cap ke data/fundamental.py (harga WAJIB dari fetch_ohlcv
    yang sama, bukan dari sumber lain, supaya konsisten).
    """
    ticker_code = f"{kode_saham.upper()}{TICKER_SUFFIX}"
    try:
        info = yf.Ticker(ticker_code).info
    except Exception as exc:  # noqa: BLE001
        return {
            "tersedia": False,
            "alasan": f"gagal mengambil data fundamental dari {DATA_SOURCE_FUNDAMENTAL} untuk {ticker_code}: {exc}",
        }

    if not info:
        return {
            "tersedia": False,
            "alasan": f"tidak ada data fundamental untuk {ticker_code} dari {DATA_SOURCE_FUNDAMENTAL}",
        }

    most_recent_quarter = info.get("mostRecentQuarter")
    tanggal_laporan = None
    if most_recent_quarter:
        try:
            tanggal_laporan = str(pd.Timestamp(most_recent_quarter, unit="s").date())
        except Exception:  # noqa: BLE001
            tanggal_laporan = None

    return {
        "tersedia": True,
        "sumber": DATA_SOURCE_FUNDAMENTAL,
        "diambil_pada": _now_wib_str(),
        "eps": info.get("trailingEps"),
        "bvps": info.get("bookValue"),
        "shares_outstanding": info.get("sharesOutstanding"),
        "tanggal_laporan": tanggal_laporan,
        "tanggal_laporan_catatan": None
        if tanggal_laporan
        else "tanggal laporan keuangan tidak tersedia dari sumber data ini — angka fundamental tetap ditampilkan tapi tanpa tanggal acuan resmi",
        "nama_perusahaan": info.get("longName") or info.get("shortName"),
    }
