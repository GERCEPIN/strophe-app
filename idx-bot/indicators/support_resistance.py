"""Auto Support/Resisten — metode fractal (swing high/low berulang). Lihat METHODOLOGY.md §4.6.

Metode dipilih: fractal, bukan pivot point klasik, karena fractal mendeteksi
level dari swing harga historis aktual (bukan hanya OHLC hari sebelumnya),
sehingga level lebih relevan untuk lookback jangka menengah dan lebih mudah
diuji unit-test dengan data sintetis yang bentuknya diketahui.
"""

import pandas as pd

DEFAULT_FRACTAL_WINDOW = 5
MIN_LEVELS = 2


def compute_support_resistance(df: pd.DataFrame, fractal_window: int = DEFAULT_FRACTAL_WINDOW) -> dict:
    n = len(df)
    min_needed = fractal_window * 2 + 1
    if n < min_needed:
        return {
            "tersedia": False,
            "alasan": f"histori data hanya {n} hari bursa, butuh minimal {min_needed} hari untuk deteksi fractal",
        }

    highs = df["High"]
    lows = df["Low"]

    swing_highs = []
    swing_lows = []
    for i in range(fractal_window, n - fractal_window):
        h_window = highs.iloc[i - fractal_window : i + fractal_window + 1]
        if highs.iloc[i] == h_window.max() and (h_window == highs.iloc[i]).sum() == 1:
            swing_highs.append(float(highs.iloc[i]))

        l_window = lows.iloc[i - fractal_window : i + fractal_window + 1]
        if lows.iloc[i] == l_window.min() and (l_window == lows.iloc[i]).sum() == 1:
            swing_lows.append(float(lows.iloc[i]))

    current_price = float(df["Close"].iloc[-1])

    resistance_candidates = sorted(set(v for v in swing_highs if v > current_price))
    support_candidates = sorted(set(v for v in swing_lows if v < current_price), reverse=True)

    resistances = resistance_candidates[:2]
    supports = support_candidates[:2]

    if not resistances and not supports:
        return {
            "tersedia": False,
            "alasan": "tidak ditemukan swing high/low yang valid pada data ini (kemungkinan trend terlalu searah/tanpa retracement)",
        }

    catatan = []
    if len(resistances) < MIN_LEVELS:
        catatan.append(f"hanya {len(resistances)} level resistance ditemukan (target {MIN_LEVELS})")
    if len(supports) < MIN_LEVELS:
        catatan.append(f"hanya {len(supports)} level support ditemukan (target {MIN_LEVELS})")

    return {
        "tersedia": True,
        "metode": f"fractal (swing high/low, {fractal_window} bar di tiap sisi)",
        "support_target_beli": supports,
        "resistance_target_jual": resistances,
        "catatan": catatan,
    }
