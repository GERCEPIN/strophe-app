"""Moving Average — trend & Golden/Death Cross. Lihat METHODOLOGY.md §4.1."""

import numpy as np
import pandas as pd

DEFAULT_PERIODS = (20, 50, 100, 200)
DEFAULT_SLOPE_LOOKBACK = 5


def compute_moving_averages(df: pd.DataFrame, periods=DEFAULT_PERIODS, slope_lookback=DEFAULT_SLOPE_LOOKBACK) -> dict:
    close = df["Close"]
    n = len(close)

    per_periode = {}
    for p in periods:
        if n < p:
            per_periode[p] = {
                "tersedia": False,
                "alasan": f"histori data hanya {n} hari bursa, butuh minimal {p} hari untuk MA{p}",
            }
            continue
        sma = close.rolling(p).mean().iloc[-1]
        ema = close.ewm(span=p, adjust=False).mean().iloc[-1]
        per_periode[p] = {"tersedia": True, "sma": round(float(sma), 2), "ema": round(float(ema), 2)}

    if n >= 200:
        ma50 = close.rolling(50).mean()
        ma200 = close.rolling(200).mean()
        diff = (ma50 - ma200).dropna()
        sign = np.sign(diff)
        changes = sign.diff().fillna(0)
        cross_dates = changes[changes != 0]
        if len(cross_dates) > 0:
            last_date = cross_dates.index[-1]
            tipe = "Golden Cross" if changes.loc[last_date] > 0 else "Death Cross"
            cross_terakhir = {"tersedia": True, "tipe": tipe, "tanggal": str(pd.Timestamp(last_date).date())}
        else:
            cross_terakhir = {"tersedia": True, "tipe": None, "tanggal": None}
    else:
        cross_terakhir = {
            "tersedia": False,
            "alasan": f"histori data hanya {n} hari bursa, butuh minimal 200 hari untuk deteksi Golden/Death Cross",
        }

    min_needed_trend = 50 + slope_lookback
    if n >= min_needed_trend:
        ma20 = close.rolling(20).mean()
        ma50 = close.rolling(50).mean()
        price = close.iloc[-1]
        ma20_now = ma20.iloc[-1]
        ma20_prev = ma20.iloc[-1 - slope_lookback]
        slope20 = ma20_now - ma20_prev
        ma50_now = ma50.iloc[-1]
        if price > ma20_now > ma50_now and slope20 > 0:
            trend = "Uptrend"
        elif price < ma20_now < ma50_now and slope20 < 0:
            trend = "Downtrend"
        else:
            trend = "Sideways"
        trend_jangka_pendek = {"tersedia": True, "status": trend}
    else:
        trend_jangka_pendek = {
            "tersedia": False,
            "alasan": f"histori data hanya {n} hari bursa, butuh minimal {min_needed_trend} hari",
        }

    return {
        "per_periode": per_periode,
        "cross_terakhir": cross_terakhir,
        "trend_jangka_pendek": trend_jangka_pendek,
    }
