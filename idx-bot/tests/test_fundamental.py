from data.fundamental import compute_fundamental


def test_per_pbv_marketcap_hand_calculated():
    result = compute_fundamental(
        eps=500,
        bvps=2500,
        shares_outstanding=1_000_000,
        harga_terkini=8750,
        tanggal_laporan="2026-04-30",
        tanggal_laporan_catatan=None,
    )
    assert result["per"] == {"tersedia": True, "nilai": round(8750 / 500, 2)}
    assert result["pbv"] == {"tersedia": True, "nilai": round(8750 / 2500, 2)}
    assert result["market_cap"] == {"tersedia": True, "nilai": round(8750 * 1_000_000, 0)}
    assert result["tanggal_laporan"] == "2026-04-30"


def test_missing_eps_only_affects_per():
    result = compute_fundamental(
        eps=None,
        bvps=2500,
        shares_outstanding=1_000_000,
        harga_terkini=8750,
        tanggal_laporan="2026-04-30",
        tanggal_laporan_catatan=None,
    )
    assert result["per"]["tersedia"] is False
    assert result["pbv"]["tersedia"] is True
    assert result["market_cap"]["tersedia"] is True


def test_zero_eps_treated_as_unavailable_not_zero_division():
    result = compute_fundamental(
        eps=0,
        bvps=2500,
        shares_outstanding=1_000_000,
        harga_terkini=8750,
        tanggal_laporan=None,
        tanggal_laporan_catatan="tidak tersedia",
    )
    assert result["per"]["tersedia"] is False


def test_no_price_marks_everything_unavailable():
    result = compute_fundamental(
        eps=500, bvps=2500, shares_outstanding=1_000_000, harga_terkini=None,
        tanggal_laporan=None, tanggal_laporan_catatan=None,
    )
    assert result["per"]["tersedia"] is False
    assert result["pbv"]["tersedia"] is False
    assert result["market_cap"]["tersedia"] is False
