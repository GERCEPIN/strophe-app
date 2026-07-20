from indicators.volume import compute_volume_signal


def test_volume_spike_confirms_uptrend(ohlcv_factory):
    rows = [{"Open": 100, "High": 101, "Low": 99, "Close": 100, "Volume": 1000} for _ in range(20)]
    rows.append({"Open": 100, "High": 106, "Low": 100, "Close": 105, "Volume": 2000})  # naik + volume 2x
    df = ohlcv_factory(rows)
    result = compute_volume_signal(df, avg_window=20)
    assert result["tersedia"] is True
    # rata-rata 20 hari (rolling termasuk hari ini): (1000*20 + 2000)/21... rolling window terakhir = 20 bar terakhir termasuk hari ini
    # window rolling(20) di baris terakhir = 19 bar volume 1000 + 1 bar volume 2000
    expected_avg = (1000 * 19 + 2000) / 20
    assert result["rata_rata_20_hari"] == round(expected_avg, 0)
    assert result["rasio_terhadap_rata_rata"] == round(2000 / expected_avg, 2)
    assert result["volume_spike"] is True
    assert "Uptrend terkonfirmasi" in result["konfirmasi"]


def test_volume_divergence_price_up_volume_down(ohlcv_factory):
    rows = [{"Open": 100, "High": 101, "Low": 99, "Close": 100, "Volume": 2000} for _ in range(20)]
    rows.append({"Open": 100, "High": 103, "Low": 100, "Close": 102, "Volume": 500})  # naik tapi volume rendah
    df = ohlcv_factory(rows)
    result = compute_volume_signal(df, avg_window=20)
    assert result["volume_spike"] is False
    assert "Divergence" in result["konfirmasi"]
    assert "harga naik" in result["konfirmasi"]


def test_volume_confirms_downtrend(ohlcv_factory):
    rows = [{"Open": 100, "High": 101, "Low": 99, "Close": 100, "Volume": 1000} for _ in range(20)]
    rows.append({"Open": 100, "High": 100, "Low": 94, "Close": 95, "Volume": 2500})  # turun + volume tinggi
    df = ohlcv_factory(rows)
    result = compute_volume_signal(df, avg_window=20)
    assert "Downtrend terkonfirmasi" in result["konfirmasi"]


def test_insufficient_data_returns_unavailable(ohlcv_factory):
    rows = [{"Open": 100, "High": 101, "Low": 99, "Close": 100, "Volume": 1000} for _ in range(5)]
    df = ohlcv_factory(rows)
    result = compute_volume_signal(df, avg_window=20)
    assert result["tersedia"] is False
