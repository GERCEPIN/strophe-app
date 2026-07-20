from indicators.moving_average import compute_moving_averages


def manual_ema(values, period):
    alpha = 2 / (period + 1)
    ema = values[0]
    for v in values[1:]:
        ema = v * alpha + ema * (1 - alpha)
    return ema


def test_sma_hand_calculated(closes_factory):
    closes = list(range(1, 41))  # 1..40, 40 hari
    df = closes_factory(closes)
    result = compute_moving_averages(df, periods=(20,))
    assert result["per_periode"][20]["tersedia"] is True
    expected_sma20 = sum(range(21, 41)) / 20  # rata-rata 21..40
    assert result["per_periode"][20]["sma"] == round(expected_sma20, 2)


def test_ema_matches_independent_manual_calc(closes_factory):
    closes = [float(x) for x in range(1, 61)]
    df = closes_factory(closes)
    result = compute_moving_averages(df, periods=(20,))
    expected_ema20 = manual_ema(closes, 20)
    assert result["per_periode"][20]["ema"] == round(expected_ema20, 2)


def test_insufficient_data_returns_unavailable(closes_factory):
    df = closes_factory([100, 101, 102])
    result = compute_moving_averages(df, periods=(20, 50, 100, 200))
    assert result["per_periode"][20]["tersedia"] is False
    assert "histori data hanya 3 hari" in result["per_periode"][20]["alasan"]
    assert result["cross_terakhir"]["tersedia"] is False
    assert result["trend_jangka_pendek"]["tersedia"] is False


def test_golden_cross_detected_in_uptrend_after_downtrend(closes_factory):
    # Turun 250 hari dulu (MA200 sempat "stabil" negatif sebelum naik dimulai),
    # baru naik tajam 150 hari — supaya titik cross terjadi setelah MA200 valid
    # (hari ke-200), bukan sebelum data cukup untuk menghitungnya.
    down_leg = [300 - i * 0.5 for i in range(250)]
    up_leg = [down_leg[-1] + i * 3 for i in range(1, 151)]
    closes = down_leg + up_leg
    df = closes_factory(closes)
    result = compute_moving_averages(df, periods=(200,))
    assert result["cross_terakhir"]["tersedia"] is True
    assert result["cross_terakhir"]["tipe"] == "Golden Cross"


def test_trend_jangka_pendek_uptrend(closes_factory):
    closes = [100 + i for i in range(60)]  # naik terus, 60 hari
    df = closes_factory(closes)
    result = compute_moving_averages(df, periods=(20, 50))
    assert result["trend_jangka_pendek"]["tersedia"] is True
    assert result["trend_jangka_pendek"]["status"] == "Uptrend"
