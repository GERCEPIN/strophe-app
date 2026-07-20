"""Cache SQLite untuk hasil analisis harian per saham.

Fase 1 hanya perlu hasil TERBARU per ticker (bukan histori lengkap) — scheduler
menimpa (upsert) baris tiap kali jalan, command Discord hanya membaca cache
ini, tidak pernah menghitung ulang per-request.
"""

import json
import sqlite3
from pathlib import Path

DEFAULT_DB_PATH = Path(__file__).parent / "idx_bot.sqlite3"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS daily_analysis (
    ticker TEXT NOT NULL PRIMARY KEY,
    tanggal_data TEXT NOT NULL,
    computed_at TEXT NOT NULL,
    payload TEXT NOT NULL
);
"""


def get_connection(db_path=DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.execute(_SCHEMA)
    conn.commit()
    return conn


def save_daily_result(conn: sqlite3.Connection, ticker: str, tanggal_data: str, computed_at: str, payload: dict) -> None:
    conn.execute(
        """
        INSERT INTO daily_analysis (ticker, tanggal_data, computed_at, payload)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(ticker) DO UPDATE SET
            tanggal_data = excluded.tanggal_data,
            computed_at = excluded.computed_at,
            payload = excluded.payload
        """,
        (ticker.upper(), tanggal_data, computed_at, json.dumps(payload, default=str)),
    )
    conn.commit()


def get_latest_result(conn: sqlite3.Connection, ticker: str) -> dict | None:
    row = conn.execute(
        "SELECT ticker, tanggal_data, computed_at, payload FROM daily_analysis WHERE ticker = ?",
        (ticker.upper(),),
    ).fetchone()
    if row is None:
        return None
    return {
        "ticker": row[0],
        "tanggal_data": row[1],
        "computed_at": row[2],
        "payload": json.loads(row[3]),
    }


def get_all_latest(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute("SELECT ticker, tanggal_data, computed_at, payload FROM daily_analysis ORDER BY ticker").fetchall()
    return [
        {"ticker": r[0], "tanggal_data": r[1], "computed_at": r[2], "payload": json.loads(r[3])}
        for r in rows
    ]


def get_last_cached_date(conn: sqlite3.Connection, ticker: str) -> str | None:
    row = conn.execute("SELECT tanggal_data FROM daily_analysis WHERE ticker = ?", (ticker.upper(),)).fetchone()
    return row[0] if row else None
