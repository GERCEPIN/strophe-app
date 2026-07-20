import pandas as pd

import analysis


def _fake_ohlcv_ok(n=210):
    dates = pd.bdate_range(start="2025-01-01", periods=n)
    rows = [
        {"Open": 100 + i * 0.1, "High": 100 + i * 0.1 + 1, "Low": 100 + i * 0.1 - 1, "Close": 100 + i * 0.1, "Volume": 1000 + (i % 5) * 100}
        for i in range(n)
    ]
    df = pd.DataFrame(rows, index=dates)
    return {
        "tersedia": True,
        "data": df,
        "sumber": "Yahoo Finance (fake)",
        "diambil_pada": "20 Jul 2026, 16:15 WIB",
        "rentang_tanggal": (str(dates[0].date()), str(dates[-1].date())),
        "jumlah_bar": n,
    }


def test_analyze_ticker_wires_all_indicators(monkeypatch):
    monkeypatch.setattr(analysis, "fetch_ohlcv", lambda kode, period="2y": _fake_ohlcv_ok())
    monkeypatch.setattr(
        analysis,
        "fetch_fundamental",
        lambda kode, harga: {
            "tersedia": True,
            "sumber": "Yahoo Finance (fake)",
            "diambil_pada": "20 Jul 2026, 16:15 WIB",
            "eps": 500,
            "bvps": 2500,
            "shares_outstanding": 1_000_000,
            "tanggal_laporan": "2026-04-30",
            "tanggal_laporan_catatan": None,
            "nama_perusahaan": "PT Contoh Tbk",
        },
    )

    result = analysis.analyze_ticker("bbca")

    assert result["ticker"] == "BBCA"
    assert result["tersedia"] is True
    for key in ["moving_average", "rsi", "adx", "volume", "fibonacci", "support_resistance", "candlestick", "bandarmology"]:
        assert key in result

    assert result["fundamental"]["tersedia"] is True
    assert result["fundamental"]["per"]["tersedia"] is True
    assert result["fundamental"]["nama_perusahaan"] == "PT Contoh Tbk"


def test_analyze_ticker_propagates_unavailable_ohlcv(monkeypatch):
    monkeypatch.setattr(
        analysis,
        "fetch_ohlcv",
        lambda kode, period="2y": {"tersedia": False, "alasan": "tidak ada data OHLCV untuk XXXX.JK"},
    )
    result = analysis.analyze_ticker("xxxx")
    assert result["tersedia"] is False
    assert "tidak ada data OHLCV" in result["alasan"]


def test_analyze_ticker_handles_unavailable_fundamental(monkeypatch):
    monkeypatch.setattr(analysis, "fetch_ohlcv", lambda kode, period="2y": _fake_ohlcv_ok())
    monkeypatch.setattr(
        analysis,
        "fetch_fundamental",
        lambda kode, harga: {"tersedia": False, "alasan": "gagal mengambil data fundamental"},
    )
    result = analysis.analyze_ticker("bbca")
    assert result["tersedia"] is True
    assert result["fundamental"]["tersedia"] is False
