from indicators.rsi import compute_rsi


def manual_rsi_sma(closes, period):
    deltas = [closes[i] - closes[i - 1] for i in range(1, len(closes))]
    last_n = deltas[-period:]
    gains = [d for d in last_n if d > 0]
    losses = [-d for d in last_n if d < 0]
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def test_rsi_hand_calculated_uptrend(closes_factory):
    closes = [44, 44.25, 44.5, 43.75, 44.65, 45.12, 45.5, 45.8, 46.3, 45.95, 45.5, 45.2, 44.9, 44.6, 44.3]
    df = closes_factory(closes)
    result = compute_rsi(df, period=14)
    assert result["tersedia"] is True
    expected = manual_rsi_sma(closes, 14)
    assert result["nilai"] == round(expected, 2)


def test_rsi_all_gains_is_100(closes_factory):
    closes = [100 + i for i in range(16)]  # naik terus
    df = closes_factory(closes)
    result = compute_rsi(df, period=14)
    assert result["tersedia"] is True
    assert result["nilai"] == 100.0
    assert result["status"] == "Overbought"


def test_rsi_status_classification_oversold(closes_factory):
    closes = [200 - i * 2 for i in range(16)]  # turun terus, semua loss
    df = closes_factory(closes)
    result = compute_rsi(df, period=14)
    assert result["tersedia"] is True
    assert result["nilai"] == 0.0
    assert result["status"] == "Oversold"


def test_insufficient_data_returns_unavailable(closes_factory):
    df = closes_factory([100, 101, 102, 103, 104])
    result = compute_rsi(df, period=14)
    assert result["tersedia"] is False
    assert "histori data hanya 5 hari" in result["alasan"]
