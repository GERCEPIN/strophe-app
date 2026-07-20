"""Job update harian: fetch + hitung semua indikator untuk seluruh watchlist,
simpan ke cache SQLite. Dijalankan otomatis tiap hari bursa ~16:15 WIB, atau
manual lewat `python3 main.py --update-now`.

Deteksi "tidak ada bar baru" (dipakai saat weekend/libur bursa, lih. §2 prompt
master soal exclude hari non-bursa): kalau tanggal bar terakhir dari sumber
data SAMA dengan yang sudah ada di cache, job ini tidak menimpa cache dan
tidak menganggapnya kegagalan — ini lebih jujur daripada hardcode kalender
libur IDX yang tidak bisa diverifikasi dari sini (lihat README).
"""

import logging

from analysis import analyze_ticker
from config import DAILY_UPDATE_HOUR_WIB, DAILY_UPDATE_MINUTE_WIB, TIMEZONE, WATCHLIST
from storage.db import get_connection, get_last_cached_date, save_daily_result

logger = logging.getLogger(__name__)


def run_daily_update(watchlist=None, db_path=None) -> dict:
    watchlist = watchlist if watchlist is not None else WATCHLIST
    conn = get_connection(db_path) if db_path is not None else get_connection()

    summary = {"berhasil": [], "gagal": [], "tidak_ada_bar_baru": []}
    try:
        for kode in watchlist:
            last_cached_date = get_last_cached_date(conn, kode)
            result = analyze_ticker(kode)

            if not result.get("tersedia"):
                logger.error("Gagal fetch/hitung %s: %s", kode, result.get("alasan"))
                summary["gagal"].append({"ticker": kode, "alasan": result.get("alasan")})
                continue

            if last_cached_date == result["tanggal_data_terakhir"]:
                logger.info("%s: tidak ada bar baru (masih %s), skip cache overwrite", kode, last_cached_date)
                summary["tidak_ada_bar_baru"].append(kode)
                continue

            save_daily_result(conn, kode, result["tanggal_data_terakhir"], result["dihitung_pada"], result)
            logger.info("%s: cache diperbarui (%s)", kode, result["tanggal_data_terakhir"])
            summary["berhasil"].append(kode)
    finally:
        conn.close()

    return summary


def start_scheduler():
    """Daftarkan job harian ke APScheduler. Dipanggil dari main.py setelah bot Discord siap."""
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.cron import CronTrigger

    scheduler = AsyncIOScheduler(timezone=TIMEZONE)
    scheduler.add_job(
        run_daily_update,
        trigger=CronTrigger(
            hour=DAILY_UPDATE_HOUR_WIB,
            minute=DAILY_UPDATE_MINUTE_WIB,
            day_of_week="mon-fri",
            timezone=TIMEZONE,
        ),
        id="daily_idx_update",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler aktif: update harian setiap Senin-Jumat %02d:%02d WIB", DAILY_UPDATE_HOUR_WIB, DAILY_UPDATE_MINUTE_WIB)
    return scheduler
