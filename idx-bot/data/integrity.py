"""Validasi integritas data OHLCV mentah sebelum dipakai indikator.

Sesuai §10.2 prompt master: deteksi bar hilang/gap, harga negatif/nol, dan
data stale — WAJIB dilaporkan (bukan disembunyikan / dipakai diam-diam).
"""

import pandas as pd

MAX_GAP_CALENDAR_DAYS = 7  # > 7 hari kalender tanpa bar dianggap gap mencurigakan
STALE_DAYS_THRESHOLD = 5  # bar terakhir lebih tua dari ini dari `as_of` dianggap stale


def check_ohlcv_integrity(df: pd.DataFrame, as_of: pd.Timestamp | None = None) -> dict:
    issues = []

    if df is None or len(df) == 0:
        return {"valid": False, "issues": ["data kosong — tidak ada bar OHLCV"]}

    for col in ["Open", "High", "Low", "Close"]:
        non_positive = df[df[col] <= 0]
        if len(non_positive) > 0:
            tanggal = [str(pd.Timestamp(d).date()) for d in non_positive.index[:5]]
            issues.append(f"harga {col} <= 0 pada tanggal: {tanggal}")

    invalid_hl = df[df["High"] < df["Low"]]
    if len(invalid_hl) > 0:
        tanggal = [str(pd.Timestamp(d).date()) for d in invalid_hl.index[:5]]
        issues.append(f"High < Low pada tanggal: {tanggal}")

    inconsistent = df[(df["High"] < df[["Open", "Close"]].max(axis=1)) | (df["Low"] > df[["Open", "Close"]].min(axis=1))]
    if len(inconsistent) > 0:
        tanggal = [str(pd.Timestamp(d).date()) for d in inconsistent.index[:5]]
        issues.append(f"High/Low tidak konsisten dengan Open/Close pada tanggal: {tanggal}")

    if len(df) > 1:
        gaps = df.index.to_series().diff().dt.days.dropna()
        suspicious = gaps[gaps > MAX_GAP_CALENDAR_DAYS]
        if len(suspicious) > 0:
            for idx in suspicious.index[:5]:
                issues.append(f"gap {int(suspicious.loc[idx])} hari kalender sebelum {str(pd.Timestamp(idx).date())}")

    if as_of is not None:
        last_bar_date = pd.Timestamp(df.index[-1])
        gap_days = (pd.Timestamp(as_of) - last_bar_date).days
        if gap_days > STALE_DAYS_THRESHOLD:
            issues.append(
                f"data stale — bar terakhir {str(last_bar_date.date())}, {gap_days} hari sebelum {str(pd.Timestamp(as_of).date())}"
            )

    return {"valid": len(issues) == 0, "issues": issues}
