import pytest

from storage.db import get_connection, get_all_latest, get_last_cached_date, get_latest_result, save_daily_result


@pytest.fixture
def conn():
    c = get_connection(":memory:")
    yield c
    c.close()


def test_save_and_get_latest_result(conn):
    save_daily_result(conn, "bbca", "2026-07-17", "17 Jul 2026, 16:15 WIB", {"rsi": {"nilai": 58}})
    result = get_latest_result(conn, "BBCA")
    assert result is not None
    assert result["ticker"] == "BBCA"
    assert result["tanggal_data"] == "2026-07-17"
    assert result["payload"]["rsi"]["nilai"] == 58


def test_get_latest_result_missing_ticker_returns_none(conn):
    assert get_latest_result(conn, "XXXX") is None


def test_upsert_overwrites_previous_value(conn):
    save_daily_result(conn, "BBCA", "2026-07-16", "16 Jul 2026, 16:15 WIB", {"rsi": {"nilai": 50}})
    save_daily_result(conn, "BBCA", "2026-07-17", "17 Jul 2026, 16:15 WIB", {"rsi": {"nilai": 58}})
    result = get_latest_result(conn, "BBCA")
    assert result["tanggal_data"] == "2026-07-17"
    assert result["payload"]["rsi"]["nilai"] == 58


def test_get_all_latest_returns_all_tickers_sorted(conn):
    save_daily_result(conn, "TLKM", "2026-07-17", "x", {})
    save_daily_result(conn, "BBCA", "2026-07-17", "x", {})
    rows = get_all_latest(conn)
    assert [r["ticker"] for r in rows] == ["BBCA", "TLKM"]


def test_get_last_cached_date(conn):
    assert get_last_cached_date(conn, "BBCA") is None
    save_daily_result(conn, "BBCA", "2026-07-17", "x", {})
    assert get_last_cached_date(conn, "BBCA") == "2026-07-17"
