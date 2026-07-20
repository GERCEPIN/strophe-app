from bot.formatter import format_analisa, format_watchlist


def _sample_result():
    return {
        "ticker": "BBCA",
        "tersedia": True,
        "harga_terkini": 8750,
        "sumber_harga": "Yahoo Finance (yfinance, ticker .JK)",
        "harga_diambil_pada": "20 Jul 2026, 16:15 WIB",
        "tanggal_data_terakhir": "2026-07-20",
        "moving_average": {
            "per_periode": {20: {"tersedia": True, "sma": 8600.0, "ema": 8620.5}},
            "cross_terakhir": {"tersedia": True, "tipe": "Golden Cross", "tanggal": "2026-06-15"},
            "trend_jangka_pendek": {"tersedia": True, "status": "Uptrend"},
        },
        "rsi": {"tersedia": True, "nilai": 58.0, "status": "Netral", "periode": 14},
        "adx": {"tersedia": True, "nilai": 31.0, "plus_di": 28.0, "minus_di": 15.0, "kekuatan_trend": "Kuat", "arah": "Bullish", "periode": 14},
        "volume": {
            "tersedia": True,
            "volume_hari_ini": 1400000,
            "rata_rata_20_hari": 1000000,
            "rasio_terhadap_rata_rata": 1.4,
            "volume_spike": False,
            "konfirmasi": "Uptrend terkonfirmasi (harga naik + volume di atas rata-rata)",
        },
        "fibonacci": {
            "tersedia": True,
            "swing_high": 9100,
            "swing_high_tanggal": "2026-07-18",
            "swing_low": 8200,
            "swing_low_tanggal": "2026-05-12",
            "arah": "uptrend (retracement dihitung turun dari swing high)",
            "retracement": {0.618: 8620.0},
            "extension": {1.272: 9345.0},
            "level_terdekat": {"level": 0.618, "harga": 8620.0},
            "lookback_hari_aktual": 90,
            "rentang_tanggal": ("2026-04-20", "2026-07-20"),
        },
        "support_resistance": {
            "tersedia": True,
            "metode": "fractal (swing high/low, 5 bar di tiap sisi)",
            "support_target_beli": [8500],
            "resistance_target_jual": [9100],
            "catatan": [],
        },
        "candlestick": {"tersedia": True, "pola_terdeteksi": [{"pola": "Bullish Engulfing", "tanggal": "2026-07-18", "harga_close": 8750}]},
        "bandarmology": {
            "tersedia": True,
            "label": "ESTIMASI Akumulasi/Distribusi (berbasis volume — data broker summary tidak tersedia)",
            "status": "Estimasi Akumulasi",
            "hari_akumulasi": 8,
            "hari_distribusi": 2,
            "lookback_hari": 20,
            "metode": "ESTIMASI berbasis volume + price action...",
        },
        "fundamental": {
            "tersedia": True,
            "nama_perusahaan": "PT Bank Central Asia Tbk",
            "per": {"tersedia": True, "nilai": 18.2},
            "pbv": {"tersedia": True, "nilai": 3.1},
            "market_cap": {"tersedia": True, "nilai": 1_080_000_000_000_000},
            "tanggal_laporan": "2026-04-30",
            "tanggal_laporan_catatan": None,
            "sumber": "Yahoo Finance (yfinance .info)",
            "diambil_pada": "20 Jul 2026, 16:15 WIB",
        },
    }


def test_format_analisa_includes_disclaimer_and_source():
    out = format_analisa(_sample_result())
    assert out["title"] == "📊 BBCA"
    assert "sumber: Yahoo Finance" in out["deskripsi"]
    assert "DYOR" in out["footer"]
    field_names = [name for name, _ in out["fields"]]
    assert "Estimasi Akumulasi/Distribusi" in field_names


def test_format_analisa_bandarmology_field_labels_estimasi():
    out = format_analisa(_sample_result())
    band_text = dict(out["fields"])["Estimasi Akumulasi/Distribusi"]
    assert "ESTIMASI" in band_text
    assert "bandarmology" not in band_text.lower().replace("estimasi akumulasi/distribusi (bandarmology proksi volume)", "")


def test_format_analisa_unavailable_ticker():
    result = {"ticker": "XXXX", "tersedia": False, "alasan": "kode saham tidak ditemukan"}
    out = format_analisa(result)
    assert "Data tidak tersedia" in out["deskripsi"]
    assert out["fields"] == []


def test_format_analisa_missing_indicator_shows_unavailable_reason():
    result = _sample_result()
    result["rsi"] = {"tersedia": False, "alasan": "histori data hanya 5 hari bursa, butuh minimal 15 hari"}
    out = format_analisa(result)
    rsi_text = dict(out["fields"])["RSI"]
    assert "Data tidak tersedia" in rsi_text
    assert "histori data hanya 5 hari" in rsi_text


def test_format_watchlist_empty():
    assert "kosong" in format_watchlist([])


def test_format_watchlist_with_rows():
    rows = [
        {
            "ticker": "BBCA",
            "tanggal_data": "2026-07-20",
            "payload": {
                "tersedia": True,
                "harga_terkini": 8750,
                "rsi": {"tersedia": True, "nilai": 58, "status": "Netral"},
                "bandarmology": {"tersedia": True, "status": "Estimasi Akumulasi"},
            },
        },
        {
            "ticker": "XXXX",
            "tanggal_data": "-",
            "payload": {"tersedia": False, "alasan": "kode tidak ditemukan"},
        },
    ]
    text = format_watchlist(rows)
    assert "BBCA" in text
    assert "Rp8,750" in text
    assert "XXXX" in text
    assert "Data tidak tersedia" in text
    assert "DYOR" in text
