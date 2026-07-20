"""Entrypoint Bot Analisa Saham IDX — Fase 1.

Pemakaian:
    python3 main.py              # jalankan bot Discord + scheduler harian otomatis
    python3 main.py --update-now # jalankan update sekali (manual, tanpa start bot Discord)
"""

import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


def main():
    if "--update-now" in sys.argv:
        from scheduler.daily_update import run_daily_update

        summary = run_daily_update()
        print(f"Berhasil: {summary['berhasil']}")
        print(f"Gagal: {summary['gagal']}")
        print(f"Tidak ada bar baru: {summary['tidak_ada_bar_baru']}")
        return

    from bot.discord_bot import run_bot

    run_bot(start_scheduler_on_ready=True)


if __name__ == "__main__":
    main()
