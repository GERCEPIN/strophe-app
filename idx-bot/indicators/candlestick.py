"""Price Action Candlestick — pola dengan aturan algoritmik eksplisit. Lihat METHODOLOGY.md §4.7.

Aturan numerik (rasio body/wick) didefinisikan eksplisit di bawah, bukan
deskripsi visual samar. Pola dicek pada 1-3 candle terakhir dari data.
"""

import pandas as pd

DOJI_BODY_RATIO_MAX = 0.1
HAMMER_WICK_BODY_RATIO_MIN = 2.0
HAMMER_OPPOSITE_WICK_RATIO_MAX = 0.3
STAR_BODY_RATIO_MAX = 0.5


def _candle_metrics(row):
    body = abs(row["Close"] - row["Open"])
    rng = row["High"] - row["Low"]
    upper_wick = row["High"] - max(row["Close"], row["Open"])
    lower_wick = min(row["Close"], row["Open"]) - row["Low"]
    return body, rng, upper_wick, lower_wick


def detect_candlestick_patterns(df: pd.DataFrame) -> dict:
    n = len(df)
    if n < 2:
        return {"tersedia": False, "alasan": f"histori data hanya {n} hari bursa, butuh minimal 2 hari untuk deteksi pola"}

    patterns = []
    cur = df.iloc[-1]
    cur_date = str(pd.Timestamp(df.index[-1]).date())
    body, rng, upper_wick, lower_wick = _candle_metrics(cur)

    if rng > 0 and body <= DOJI_BODY_RATIO_MAX * rng:
        patterns.append({"pola": "Doji", "tanggal": cur_date, "harga_close": round(float(cur["Close"]), 2)})

    if body > 0:
        if lower_wick >= HAMMER_WICK_BODY_RATIO_MIN * body and upper_wick <= HAMMER_OPPOSITE_WICK_RATIO_MAX * body:
            patterns.append({"pola": "Hammer", "tanggal": cur_date, "harga_close": round(float(cur["Close"]), 2)})
        if upper_wick >= HAMMER_WICK_BODY_RATIO_MIN * body and lower_wick <= HAMMER_OPPOSITE_WICK_RATIO_MAX * body:
            patterns.append({"pola": "Shooting Star", "tanggal": cur_date, "harga_close": round(float(cur["Close"]), 2)})

    prev = df.iloc[-2]
    prev_body_low, prev_body_high = min(prev["Open"], prev["Close"]), max(prev["Open"], prev["Close"])
    cur_body_low, cur_body_high = min(cur["Open"], cur["Close"]), max(cur["Open"], cur["Close"])

    prev_bearish = prev["Close"] < prev["Open"]
    prev_bullish = prev["Close"] > prev["Open"]
    cur_bullish = cur["Close"] > cur["Open"]
    cur_bearish = cur["Close"] < cur["Open"]
    engulfs = cur_body_low <= prev_body_low and cur_body_high >= prev_body_high

    if prev_bearish and cur_bullish and engulfs:
        patterns.append({"pola": "Bullish Engulfing", "tanggal": cur_date, "harga_close": round(float(cur["Close"]), 2)})
    if prev_bullish and cur_bearish and engulfs:
        patterns.append({"pola": "Bearish Engulfing", "tanggal": cur_date, "harga_close": round(float(cur["Close"]), 2)})

    if n >= 3:
        a = df.iloc[-3]
        b = df.iloc[-2]
        c = df.iloc[-1]
        a_body = abs(a["Close"] - a["Open"])
        b_body = abs(b["Close"] - b["Open"])
        a_mid = (a["Open"] + a["Close"]) / 2

        if a["Close"] < a["Open"] and a_body > 0 and b_body <= STAR_BODY_RATIO_MAX * a_body and c["Close"] > c["Open"] and c["Close"] > a_mid:
            patterns.append({"pola": "Morning Star", "tanggal": cur_date, "harga_close": round(float(c["Close"]), 2)})
        if a["Close"] > a["Open"] and a_body > 0 and b_body <= STAR_BODY_RATIO_MAX * a_body and c["Close"] < c["Open"] and c["Close"] < a_mid:
            patterns.append({"pola": "Evening Star", "tanggal": cur_date, "harga_close": round(float(c["Close"]), 2)})

    return {"tersedia": True, "pola_terdeteksi": patterns}
