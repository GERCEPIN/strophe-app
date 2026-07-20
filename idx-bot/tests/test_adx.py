from indicators.adx import compute_adx


def _sma(values, period, end_idx):
    """Rata-rata sederhana window `period` yang berakhir di end_idx (inklusif)."""
    start = end_idx - period + 1
    if start < 0:
        return None
    window = values[start : end_idx + 1]
    return sum(window) / period


def manual_adx(highs, lows, closes, period):
    n = len(highs)
    plus_dm = [0.0] * n
    minus_dm = [0.0] * n
    tr = [0.0] * n
    for i in range(1, n):
        up_move = highs[i] - highs[i - 1]
        down_move = lows[i - 1] - lows[i]
        plus_dm[i] = up_move if (up_move > down_move and up_move > 0) else 0.0
        minus_dm[i] = down_move if (down_move > up_move and down_move > 0) else 0.0
        tr[i] = max(highs[i] - lows[i], abs(highs[i] - closes[i - 1]), abs(lows[i] - closes[i - 1]))
    tr[0] = highs[0] - lows[0]

    dx_series = {}
    for i in range(n):
        atr = _sma(tr, period, i)
        pdm_avg = _sma(plus_dm, period, i)
        mdm_avg = _sma(minus_dm, period, i)
        if atr is None or atr == 0:
            continue
        pdi = 100 * pdm_avg / atr
        mdi = 100 * mdm_avg / atr
        if pdi + mdi == 0:
            continue
        dx_series[i] = 100 * abs(pdi - mdi) / (pdi + mdi)

    last_idx = n - 1
    dx_window = [dx_series[i] for i in range(last_idx - period + 1, last_idx + 1) if i in dx_series]
    adx_value = sum(dx_window) / period if len(dx_window) == period else None

    atr_last = _sma(tr, period, last_idx)
    pdi_last = 100 * _sma(plus_dm, period, last_idx) / atr_last
    mdi_last = 100 * _sma(minus_dm, period, last_idx) / atr_last

    return adx_value, pdi_last, mdi_last


def test_adx_matches_independent_manual_calc(ohlcv_factory):
    n = 40
    rows = []
    price = 100.0
    for i in range(n):
        price += 1.0  # uptrend murni dan stabil
        rows.append({"Open": price - 0.5, "High": price + 0.5, "Low": price - 1.0, "Close": price, "Volume": 1000})
    df = ohlcv_factory(rows)

    result = compute_adx(df, period=14)
    assert result["tersedia"] is True

    highs = [r["High"] for r in rows]
    lows = [r["Low"] for r in rows]
    closes = [r["Close"] for r in rows]
    expected_adx, expected_pdi, expected_mdi = manual_adx(highs, lows, closes, 14)

    assert expected_adx is not None
    assert result["nilai"] == round(expected_adx, 2)
    assert result["plus_di"] == round(expected_pdi, 2)
    assert result["minus_di"] == round(expected_mdi, 2)


def test_adx_uptrend_direction_is_bullish(ohlcv_factory):
    n = 40
    rows = []
    price = 100.0
    for i in range(n):
        price += 1.0
        rows.append({"Open": price - 0.5, "High": price + 0.5, "Low": price - 1.0, "Close": price, "Volume": 1000})
    df = ohlcv_factory(rows)
    result = compute_adx(df, period=14)
    assert result["arah"] == "Bullish"
    assert result["plus_di"] > result["minus_di"]
    assert 0 <= result["nilai"] <= 100


def test_insufficient_data_returns_unavailable(ohlcv_factory):
    rows = [{"Open": 100, "High": 101, "Low": 99, "Close": 100, "Volume": 1000} for _ in range(10)]
    df = ohlcv_factory(rows)
    result = compute_adx(df, period=14)
    assert result["tersedia"] is False
