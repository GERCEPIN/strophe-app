"""ADX (Average Directional Index) — kekuatan & arah trend. Lihat METHODOLOGY.md §4.3.

Catatan metodologi: memakai rata-rata pergerakan sederhana (SMA) untuk smoothing
+DM/-DM/TR dan DX (bukan smoothing eksponensial Wilder asli), demi keterujian
lewat unit test dengan nilai yang bisa dihitung ulang secara manual.
"""

import pandas as pd

DEFAULT_PERIOD = 14
WEAK_MAX = 20
STRONG_MIN = 25


def compute_adx(df: pd.DataFrame, period: int = DEFAULT_PERIOD) -> dict:
    n = len(df)
    min_needed = period * 2
    if n < min_needed:
        return {
            "tersedia": False,
            "alasan": f"histori data hanya {n} hari bursa, butuh minimal {min_needed} hari untuk ADX({period})",
        }

    high, low, close = df["High"], df["Low"], df["Close"]

    up_move = high.diff().fillna(0)
    down_move = -low.diff().fillna(0)

    plus_dm = ((up_move > down_move) & (up_move > 0)) * up_move
    minus_dm = ((down_move > up_move) & (down_move > 0)) * down_move

    tr = pd.concat(
        [high - low, (high - close.shift()).abs(), (low - close.shift()).abs()],
        axis=1,
    ).max(axis=1)

    atr = tr.rolling(period).mean()
    plus_di = 100 * plus_dm.rolling(period).mean() / atr
    minus_di = 100 * minus_dm.rolling(period).mean() / atr

    di_sum = plus_di + minus_di
    dx = 100 * (plus_di - minus_di).abs() / di_sum.where(di_sum != 0, other=pd.NA)
    adx = dx.rolling(period).mean()

    value = adx.iloc[-1]
    pdi_val = plus_di.iloc[-1]
    mdi_val = minus_di.iloc[-1]

    if pd.isna(value) or pd.isna(pdi_val) or pd.isna(mdi_val):
        return {
            "tersedia": False,
            "alasan": "ADX tidak dapat dihitung (data tidak cukup setelah smoothing ganda)",
        }

    if value < WEAK_MAX:
        kekuatan = "Lemah/Sideways"
    elif value <= STRONG_MIN:
        kekuatan = "Transisi"
    else:
        kekuatan = "Kuat"

    arah = "Bullish" if pdi_val > mdi_val else "Bearish"

    return {
        "tersedia": True,
        "nilai": round(float(value), 2),
        "plus_di": round(float(pdi_val), 2),
        "minus_di": round(float(mdi_val), 2),
        "kekuatan_trend": kekuatan,
        "arah": arah,
        "periode": period,
    }
