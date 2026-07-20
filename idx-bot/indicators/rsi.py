"""RSI (Relative Strength Index) — overbought/oversold. Lihat METHODOLOGY.md §4.2.

Catatan metodologi: memakai rata-rata pergerakan sederhana (SMA) atas gain/loss
per periode (varian "Cutler's RSI"), bukan smoothing eksponensial Wilder asli.
Dipilih supaya hasil bisa diverifikasi manual persis lewat unit test. Nilai bisa
sedikit berbeda dari platform yang memakai Wilder's smoothing, tapi interpretasi
sinyal (overbought/oversold) sama.
"""

import pandas as pd

DEFAULT_PERIOD = 14
OVERBOUGHT = 70
OVERSOLD = 30


def compute_rsi(df: pd.DataFrame, period: int = DEFAULT_PERIOD) -> dict:
    close = df["Close"]
    n = len(close)
    if n < period + 1:
        return {
            "tersedia": False,
            "alasan": f"histori data hanya {n} hari bursa, butuh minimal {period + 1} hari untuk RSI({period})",
        }

    delta = close.diff().dropna()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(period).mean().iloc[-1]
    avg_loss = loss.rolling(period).mean().iloc[-1]

    if avg_loss == 0:
        value = 100.0
    else:
        rs = avg_gain / avg_loss
        value = 100 - (100 / (1 + rs))

    if value > OVERBOUGHT:
        status = "Overbought"
    elif value < OVERSOLD:
        status = "Oversold"
    else:
        status = "Netral"

    return {"tersedia": True, "nilai": round(float(value), 2), "status": status, "periode": period}
