"""Volume — validasi konfirmasi pergerakan harga. Lihat METHODOLOGY.md §4.4."""

import pandas as pd

DEFAULT_AVG_WINDOW = 20
SPIKE_MULTIPLIER = 1.5


def compute_volume_signal(df: pd.DataFrame, avg_window: int = DEFAULT_AVG_WINDOW, spike_multiplier: float = SPIKE_MULTIPLIER) -> dict:
    volume = df["Volume"]
    close = df["Close"]
    n = len(df)
    if n < avg_window + 1:
        return {
            "tersedia": False,
            "alasan": f"histori data hanya {n} hari bursa, butuh minimal {avg_window + 1} hari",
        }

    avg_vol = volume.rolling(avg_window).mean().iloc[-1]
    vol_today = volume.iloc[-1]

    if avg_vol == 0:
        return {"tersedia": False, "alasan": "rata-rata volume 20 hari bernilai nol, kemungkinan saham suspend/tidak likuid"}

    ratio = vol_today / avg_vol
    spike = ratio >= spike_multiplier

    price_change = close.iloc[-1] - close.iloc[-2]
    naik_volume = ratio > 1

    if price_change > 0 and naik_volume:
        konfirmasi = "Uptrend terkonfirmasi (harga naik + volume di atas rata-rata)"
    elif price_change > 0 and not naik_volume:
        konfirmasi = "Divergence (harga naik, volume di bawah rata-rata) — potensi trend lemah"
    elif price_change < 0 and naik_volume:
        konfirmasi = "Downtrend terkonfirmasi (harga turun + volume di atas rata-rata)"
    elif price_change < 0 and not naik_volume:
        konfirmasi = "Divergence (harga turun, volume di bawah rata-rata) — potensi trend lemah"
    else:
        konfirmasi = "Harga stagnan"

    return {
        "tersedia": True,
        "volume_hari_ini": int(vol_today),
        "rata_rata_20_hari": round(float(avg_vol), 0),
        "rasio_terhadap_rata_rata": round(float(ratio), 2),
        "volume_spike": bool(spike),
        "konfirmasi": konfirmasi,
    }
