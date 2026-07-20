import scheduler.daily_update as daily_update
from storage.db import get_connection, get_latest_result


def _fake_result(ticker, tanggal):
    return {
        "ticker": ticker,
        "tersedia": True,
        "dihitung_pada": "20 Jul 2026, 16:15 WIB",
        "tanggal_data_terakhir": tanggal,
        "rsi": {"tersedia": True, "nilai": 55, "status": "Netral"},
    }


def test_run_daily_update_saves_new_results(monkeypatch):
    def fake_analyze(kode):
        return _fake_result(kode, "2026-07-17")

    monkeypatch.setattr(daily_update, "analyze_ticker", fake_analyze)

    summary = daily_update.run_daily_update(watchlist=["BBCA", "TLKM"], db_path=":memory:")
    assert summary["berhasil"] == ["BBCA", "TLKM"]
    assert summary["gagal"] == []
    assert summary["tidak_ada_bar_baru"] == []


def test_run_daily_update_skips_when_no_new_bar(monkeypatch, tmp_path):
    db_path = str(tmp_path / "test.sqlite3")

    def fake_analyze_day1(kode):
        return _fake_result(kode, "2026-07-17")

    monkeypatch.setattr(daily_update, "analyze_ticker", fake_analyze_day1)
    first = daily_update.run_daily_update(watchlist=["BBCA"], db_path=db_path)
    assert first["berhasil"] == ["BBCA"]

    # Run kedua (misal weekend) — tanggal bar terakhir masih sama, harus di-skip
    second = daily_update.run_daily_update(watchlist=["BBCA"], db_path=db_path)
    assert second["tidak_ada_bar_baru"] == ["BBCA"]
    assert second["berhasil"] == []


def test_run_daily_update_records_failures_without_crashing(monkeypatch):
    def fake_analyze(kode):
        if kode == "BBCA":
            return _fake_result(kode, "2026-07-17")
        return {"ticker": kode, "tersedia": False, "alasan": "gagal fetch"}

    monkeypatch.setattr(daily_update, "analyze_ticker", fake_analyze)
    summary = daily_update.run_daily_update(watchlist=["BBCA", "XXXX"], db_path=":memory:")
    assert summary["berhasil"] == ["BBCA"]
    assert summary["gagal"] == [{"ticker": "XXXX", "alasan": "gagal fetch"}]


def test_saved_payload_readable_back_from_db(monkeypatch):
    monkeypatch.setattr(daily_update, "analyze_ticker", lambda kode: _fake_result(kode, "2026-07-17"))
    daily_update.run_daily_update(watchlist=["BBCA"], db_path=":memory:")
    # Note: db_path=":memory:" di atas sudah tertutup (koneksi baru tiap panggilan run_daily_update),
    # jadi verifikasi baca-tulis dites terpisah lewat file sungguhan:


def test_persisted_to_real_file(monkeypatch, tmp_path):
    db_path = str(tmp_path / "persist.sqlite3")
    monkeypatch.setattr(daily_update, "analyze_ticker", lambda kode: _fake_result(kode, "2026-07-17"))
    daily_update.run_daily_update(watchlist=["BBCA"], db_path=db_path)

    conn = get_connection(db_path)
    saved = get_latest_result(conn, "BBCA")
    conn.close()
    assert saved is not None
    assert saved["payload"]["rsi"]["nilai"] == 55
