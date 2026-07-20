import pandas as pd

from data.integrity import check_ohlcv_integrity


def _clean_df(n=10):
    dates = pd.bdate_range(start="2024-01-01", periods=n)
    rows = [{"Open": 100, "High": 101, "Low": 99, "Close": 100, "Volume": 1000} for _ in range(n)]
    return pd.DataFrame(rows, index=dates)


def test_clean_data_is_valid():
    df = _clean_df()
    result = check_ohlcv_integrity(df)
    assert result["valid"] is True
    assert result["issues"] == []


def test_empty_dataframe_invalid():
    result = check_ohlcv_integrity(pd.DataFrame())
    assert result["valid"] is False
    assert "kosong" in result["issues"][0]


def test_negative_or_zero_price_detected():
    df = _clean_df()
    df.iloc[3, df.columns.get_loc("Close")] = 0
    result = check_ohlcv_integrity(df)
    assert result["valid"] is False
    assert any("Close" in issue for issue in result["issues"])


def test_high_below_low_detected():
    df = _clean_df()
    df.iloc[5, df.columns.get_loc("High")] = 50
    df.iloc[5, df.columns.get_loc("Low")] = 60
    result = check_ohlcv_integrity(df)
    assert result["valid"] is False
    assert any("High < Low" in issue for issue in result["issues"])


def test_suspicious_gap_detected():
    dates = list(pd.bdate_range(start="2024-01-01", periods=5)) + list(
        pd.bdate_range(start="2024-03-01", periods=5)
    )
    rows = [{"Open": 100, "High": 101, "Low": 99, "Close": 100, "Volume": 1000} for _ in range(10)]
    df = pd.DataFrame(rows, index=pd.DatetimeIndex(dates))
    result = check_ohlcv_integrity(df)
    assert result["valid"] is False
    assert any("gap" in issue for issue in result["issues"])


def test_stale_data_detected_with_as_of():
    df = _clean_df()
    as_of = pd.Timestamp(df.index[-1]) + pd.Timedelta(days=30)
    result = check_ohlcv_integrity(df, as_of=as_of)
    assert result["valid"] is False
    assert any("stale" in issue for issue in result["issues"])


def test_recent_data_not_flagged_stale():
    df = _clean_df()
    as_of = pd.Timestamp(df.index[-1]) + pd.Timedelta(days=1)
    result = check_ohlcv_integrity(df, as_of=as_of)
    assert result["valid"] is True
