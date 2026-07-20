from indicators.bandarmology import estimasi_akumulasi_distribusi


def _build_rows(closes, volumes):
    return [{"Open": c, "High": c + 1, "Low": c - 1, "Close": c, "Volume": v} for c, v in zip(closes, volumes)]


def test_estimasi_akumulasi(ohlcv_factory):
    closes = [100, 101, 100.5, 102, 101, 103] + [103] * 15  # 21 hari
    volumes = [1000, 3000, 500, 3000, 500, 3000] + [500] * 15
    df = ohlcv_factory(_build_rows(closes, volumes))
    result = estimasi_akumulasi_distribusi(df, lookback_days=20)
    assert result["tersedia"] is True
    assert result["hari_akumulasi"] == 3
    assert result["hari_distribusi"] == 0
    assert result["status"] == "Estimasi Akumulasi"
    assert "ESTIMASI" in result["label"]


def test_estimasi_distribusi(ohlcv_factory):
    closes = [100, 99, 99.5, 98, 98.5, 97] + [97] * 15
    volumes = [1000, 3000, 500, 3000, 500, 3000] + [500] * 15
    df = ohlcv_factory(_build_rows(closes, volumes))
    result = estimasi_akumulasi_distribusi(df, lookback_days=20)
    assert result["hari_distribusi"] == 3
    assert result["hari_akumulasi"] == 0
    assert result["status"] == "Estimasi Distribusi"


def test_estimasi_netral(ohlcv_factory):
    closes = [100, 101, 100] + [100] * 18  # 21 hari, 1 naik 1 turun lalu flat
    volumes = [1000, 3000, 3000] + [500] * 18
    df = ohlcv_factory(_build_rows(closes, volumes))
    result = estimasi_akumulasi_distribusi(df, lookback_days=20)
    assert result["status"] == "Netral/Campur"
    assert abs(result["selisih_hari"]) < 3


def test_insufficient_data_returns_unavailable(ohlcv_factory):
    df = ohlcv_factory(_build_rows([100, 101, 102], [1000, 1000, 1000]))
    result = estimasi_akumulasi_distribusi(df, lookback_days=20)
    assert result["tersedia"] is False
