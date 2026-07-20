from indicators.support_resistance import compute_support_resistance


def _base_rows(n):
    return [{"Open": 100, "High": 100, "Low": 90, "Close": 95, "Volume": 1000} for _ in range(n)]


def test_fractal_swing_detection_hand_placed(ohlcv_factory):
    n = 90
    rows = _base_rows(n)
    rows[15]["High"] = 120  # resistance #1 (lebih dekat)
    rows[45]["High"] = 125  # resistance #2
    rows[25]["Low"] = 70  # support #1 (lebih dekat)
    rows[60]["Low"] = 65  # support #2
    rows[n - 1]["Close"] = 95
    df = ohlcv_factory(rows)

    result = compute_support_resistance(df, fractal_window=5)
    assert result["tersedia"] is True
    assert result["resistance_target_jual"] == [120, 125]
    assert result["support_target_beli"] == [70, 65]


def test_monotonic_series_finds_no_swings(ohlcv_factory):
    n = 60
    rows = [
        {"Open": 100 + i, "High": 100 + i, "Low": 100 + i, "Close": 100 + i, "Volume": 1000}
        for i in range(n)
    ]
    from indicators.support_resistance import compute_support_resistance as csr

    df = None
    import pandas as pd

    dates = pd.bdate_range(start="2024-01-01", periods=n)
    df = pd.DataFrame(rows, index=dates)[["Open", "High", "Low", "Close", "Volume"]]
    result = csr(df, fractal_window=5)
    assert result["tersedia"] is False


def test_insufficient_data_returns_unavailable(ohlcv_factory):
    df = ohlcv_factory(_base_rows(5))
    result = compute_support_resistance(df, fractal_window=5)
    assert result["tersedia"] is False
