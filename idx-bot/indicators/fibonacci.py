"""Fibonacci retracement/extension — auto support & resisten. Lihat METHODOLOGY.md §4.5."""

import pandas as pd

DEFAULT_LOOKBACK_DAYS = 90
MIN_LOOKBACK_DAYS = 60
RETRACEMENT_LEVELS = (0.236, 0.382, 0.5, 0.618, 0.786)
EXTENSION_LEVELS = (1.272, 1.618)


def compute_fibonacci(df: pd.DataFrame, lookback_days: int = DEFAULT_LOOKBACK_DAYS) -> dict:
    n = len(df)
    if n < MIN_LOOKBACK_DAYS:
        return {
            "tersedia": False,
            "alasan": f"histori data hanya {n} hari bursa, butuh minimal {MIN_LOOKBACK_DAYS} hari untuk swing lookback",
        }

    actual_window = min(lookback_days, n)
    window = df.tail(actual_window)

    swing_high = float(window["High"].max())
    swing_high_date = window["High"].idxmax()
    swing_low = float(window["Low"].min())
    swing_low_date = window["Low"].idxmin()
    diff = swing_high - swing_low

    if diff <= 0:
        return {"tersedia": False, "alasan": "swing high sama dengan swing low pada window ini, tidak bisa hitung Fibonacci"}

    uptrend_leg = swing_low_date < swing_high_date

    retracement = {}
    extension = {}
    if uptrend_leg:
        arah = "uptrend (retracement dihitung turun dari swing high)"
        for lvl in RETRACEMENT_LEVELS:
            retracement[lvl] = round(swing_high - diff * lvl, 2)
        for lvl in EXTENSION_LEVELS:
            extension[lvl] = round(swing_high + diff * (lvl - 1), 2)
    else:
        arah = "downtrend (retracement dihitung naik dari swing low)"
        for lvl in RETRACEMENT_LEVELS:
            retracement[lvl] = round(swing_low + diff * lvl, 2)
        for lvl in EXTENSION_LEVELS:
            extension[lvl] = round(swing_low - diff * (lvl - 1), 2)

    current_price = float(df["Close"].iloc[-1])
    level_terdekat = min(retracement.items(), key=lambda kv: abs(kv[1] - current_price))

    return {
        "tersedia": True,
        "swing_high": round(swing_high, 2),
        "swing_high_tanggal": str(pd.Timestamp(swing_high_date).date()),
        "swing_low": round(swing_low, 2),
        "swing_low_tanggal": str(pd.Timestamp(swing_low_date).date()),
        "arah": arah,
        "retracement": retracement,
        "extension": extension,
        "level_terdekat": {"level": level_terdekat[0], "harga": level_terdekat[1]},
        "lookback_hari_aktual": actual_window,
        "rentang_tanggal": (str(pd.Timestamp(window.index[0]).date()), str(pd.Timestamp(window.index[-1]).date())),
    }
