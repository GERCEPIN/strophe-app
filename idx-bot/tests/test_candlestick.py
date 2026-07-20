from indicators.candlestick import detect_candlestick_patterns


def _names(result):
    return {p["pola"] for p in result["pola_terdeteksi"]}


def test_doji_detected(ohlcv_factory):
    rows = [
        {"Open": 100, "High": 100.5, "Low": 99.5, "Close": 100, "Volume": 1000},
        {"Open": 100, "High": 105, "Low": 95, "Close": 100.05, "Volume": 1000},
    ]
    df = ohlcv_factory(rows)
    result = detect_candlestick_patterns(df)
    assert result["tersedia"] is True
    assert "Doji" in _names(result)


def test_hammer_detected(ohlcv_factory):
    rows = [
        {"Open": 100, "High": 100.5, "Low": 99.5, "Close": 100, "Volume": 1000},
        {"Open": 100, "High": 101.2, "Low": 95, "Close": 101, "Volume": 1000},
    ]
    df = ohlcv_factory(rows)
    result = detect_candlestick_patterns(df)
    assert "Hammer" in _names(result)


def test_shooting_star_detected(ohlcv_factory):
    rows = [
        {"Open": 100, "High": 100.5, "Low": 99.5, "Close": 100, "Volume": 1000},
        {"Open": 100, "High": 105, "Low": 98.8, "Close": 99, "Volume": 1000},
    ]
    df = ohlcv_factory(rows)
    result = detect_candlestick_patterns(df)
    assert "Shooting Star" in _names(result)


def test_bullish_engulfing_detected(ohlcv_factory):
    rows = [
        {"Open": 100, "High": 100.5, "Low": 94, "Close": 95, "Volume": 1000},  # bearish
        {"Open": 94, "High": 101.5, "Low": 93.5, "Close": 101, "Volume": 1000},  # bullish, engulf
    ]
    df = ohlcv_factory(rows)
    result = detect_candlestick_patterns(df)
    assert "Bullish Engulfing" in _names(result)


def test_bearish_engulfing_detected(ohlcv_factory):
    rows = [
        {"Open": 95, "High": 100.5, "Low": 94.5, "Close": 100, "Volume": 1000},  # bullish
        {"Open": 101, "High": 101.5, "Low": 93.5, "Close": 94, "Volume": 1000},  # bearish, engulf
    ]
    df = ohlcv_factory(rows)
    result = detect_candlestick_patterns(df)
    assert "Bearish Engulfing" in _names(result)


def test_morning_star_detected(ohlcv_factory):
    rows = [
        {"Open": 110, "High": 111, "Low": 99, "Close": 100, "Volume": 1000},  # bearish besar
        {"Open": 99, "High": 99.5, "Low": 97.5, "Close": 98, "Volume": 1000},  # body kecil
        {"Open": 98, "High": 109, "Low": 97, "Close": 108, "Volume": 1000},  # bullish besar, tutup > mid a
    ]
    df = ohlcv_factory(rows)
    result = detect_candlestick_patterns(df)
    assert "Morning Star" in _names(result)


def test_evening_star_detected(ohlcv_factory):
    rows = [
        {"Open": 100, "High": 111, "Low": 99, "Close": 110, "Volume": 1000},  # bullish besar
        {"Open": 111, "High": 112.5, "Low": 110.5, "Close": 112, "Volume": 1000},  # body kecil
        {"Open": 112, "High": 113, "Low": 101, "Close": 102, "Volume": 1000},  # bearish besar, tutup < mid a
    ]
    df = ohlcv_factory(rows)
    result = detect_candlestick_patterns(df)
    assert "Evening Star" in _names(result)


def test_insufficient_data_returns_unavailable(ohlcv_factory):
    rows = [{"Open": 100, "High": 101, "Low": 99, "Close": 100, "Volume": 1000}]
    df = ohlcv_factory(rows)
    result = detect_candlestick_patterns(df)
    assert result["tersedia"] is False
