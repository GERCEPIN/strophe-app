import pandas as pd
import pytest


def build_df(rows, start="2024-01-01"):
    """rows: list of dicts with keys Open, High, Low, Close, Volume (in order, oldest first)."""
    dates = pd.bdate_range(start=start, periods=len(rows))
    df = pd.DataFrame(rows, index=dates)
    return df[["Open", "High", "Low", "Close", "Volume"]]


def build_from_closes(closes, volumes=None, start="2024-01-01"):
    """Build an OHLCV frame where Open=High=Low=Close for each day (simplifies price-only tests)."""
    if volumes is None:
        volumes = [1000] * len(closes)
    rows = [
        {"Open": c, "High": c, "Low": c, "Close": c, "Volume": v}
        for c, v in zip(closes, volumes)
    ]
    return build_df(rows, start=start)


@pytest.fixture
def ohlcv_factory():
    return build_df


@pytest.fixture
def closes_factory():
    return build_from_closes
