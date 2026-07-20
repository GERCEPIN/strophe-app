from indicators.fibonacci import compute_fibonacci


def _base_rows(n):
    return [{"Open": 100, "High": 100, "Low": 100, "Close": 100, "Volume": 1000} for _ in range(n)]


def test_fibonacci_uptrend_retracement_hand_calculated(ohlcv_factory):
    rows = _base_rows(90)
    rows[10]["Low"] = 50  # swing low lebih dulu
    rows[70]["High"] = 150  # swing high belakangan -> uptrend leg
    rows[89]["Close"] = 120  # harga sekarang
    df = ohlcv_factory(rows)

    result = compute_fibonacci(df, lookback_days=90)
    assert result["tersedia"] is True
    assert result["swing_high"] == 150
    assert result["swing_low"] == 50
    assert "uptrend" in result["arah"]

    # diff = 100, retracement = swing_high - diff*level
    assert result["retracement"][0.5] == 100.0
    assert result["retracement"][0.236] == round(150 - 100 * 0.236, 2)
    assert result["retracement"][0.618] == round(150 - 100 * 0.618, 2)

    # extension = swing_high + diff*(level-1)
    assert result["extension"][1.272] == round(150 + 100 * 0.272, 2)
    assert result["extension"][1.618] == round(150 + 100 * 0.618, 2)

    # level terdekat dengan harga 120 -> level 0.236 (126.4)
    assert result["level_terdekat"]["level"] == 0.236


def test_fibonacci_downtrend_retracement(ohlcv_factory):
    rows = _base_rows(90)
    rows[10]["High"] = 150  # swing high lebih dulu
    rows[70]["Low"] = 50  # swing low belakangan -> downtrend leg
    df = ohlcv_factory(rows)

    result = compute_fibonacci(df, lookback_days=90)
    assert "downtrend" in result["arah"]
    # retracement = swing_low + diff*level
    assert result["retracement"][0.5] == 100.0


def test_insufficient_data_returns_unavailable(ohlcv_factory):
    df = ohlcv_factory(_base_rows(30))
    result = compute_fibonacci(df, lookback_days=90)
    assert result["tersedia"] is False
    assert "histori data hanya 30 hari" in result["alasan"]
