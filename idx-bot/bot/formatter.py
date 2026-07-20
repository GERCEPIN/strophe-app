"""Format hasil analisis jadi teks siap tampil. Sengaja tidak bergantung pada
discord.py di sini supaya bisa diuji tanpa framework bot — discord_bot.py
yang membungkusnya jadi Embed.

Fase 1 TIDAK menampilkan skor/sinyal gabungan (§7 prompt master) — itu scope
Fase 2 (lihat RENCANA EKSEKUSI). Tiap indikator ditampilkan apa adanya per
komponen, dengan sumber, timestamp, dan "Data tidak tersedia" eksplisit sesuai
Aturan §1.
"""

from config import DISCLAIMER


def _fmt_ma(ma: dict) -> str:
    lines = []
    for p, v in ma["per_periode"].items():
        if v["tersedia"]:
            lines.append(f"MA{p}: SMA {v['sma']:,} | EMA {v['ema']:,}")
        else:
            lines.append(f"MA{p}: Data tidak tersedia ({v['alasan']})")

    cross = ma["cross_terakhir"]
    if cross["tersedia"]:
        if cross["tipe"]:
            lines.append(f"Cross terakhir: {cross['tipe']} pada {cross['tanggal']}")
        else:
            lines.append("Cross terakhir: belum ada Golden/Death Cross pada rentang data yang tersedia")
    else:
        lines.append(f"Cross: Data tidak tersedia ({cross['alasan']})")

    trend = ma["trend_jangka_pendek"]
    if trend["tersedia"]:
        lines.append(f"Trend jangka pendek: {trend['status']}")
    else:
        lines.append(f"Trend jangka pendek: Data tidak tersedia ({trend['alasan']})")

    return "\n".join(lines)


def _fmt_rsi(rsi: dict) -> str:
    if not rsi["tersedia"]:
        return f"Data tidak tersedia ({rsi['alasan']})"
    return f"RSI({rsi['periode']}): {rsi['nilai']} — {rsi['status']}"


def _fmt_adx(adx: dict) -> str:
    if not adx["tersedia"]:
        return f"Data tidak tersedia ({adx['alasan']})"
    return (
        f"ADX({adx['periode']}): {adx['nilai']} — {adx['kekuatan_trend']}, "
        f"arah {adx['arah']} (+DI {adx['plus_di']} / -DI {adx['minus_di']})"
    )


def _fmt_volume(vol: dict) -> str:
    if not vol["tersedia"]:
        return f"Data tidak tersedia ({vol['alasan']})"
    spike = " ⚡ SPIKE" if vol["volume_spike"] else ""
    return (
        f"Volume: {vol['volume_hari_ini']:,} vs rata-rata 20 hari {vol['rata_rata_20_hari']:,.0f} "
        f"({vol['rasio_terhadap_rata_rata']}x){spike}\n{vol['konfirmasi']}"
    )


def _fmt_fibonacci(fib: dict) -> str:
    if not fib["tersedia"]:
        return f"Data tidak tersedia ({fib['alasan']})"
    lines = [
        f"Swing High: {fib['swing_high']:,} ({fib['swing_high_tanggal']})",
        f"Swing Low: {fib['swing_low']:,} ({fib['swing_low_tanggal']})",
        f"Arah: {fib['arah']}",
        f"Lookback: {fib['lookback_hari_aktual']} hari ({fib['rentang_tanggal'][0]} – {fib['rentang_tanggal'][1]})",
        "Retracement: " + ", ".join(f"{float(lvl) * 100:.1f}%={val:,}" for lvl, val in fib["retracement"].items()),
        "Extension: " + ", ".join(f"{float(lvl) * 100:.1f}%={val:,}" for lvl, val in fib["extension"].items()),
        f"Level terdekat harga sekarang: {float(fib['level_terdekat']['level']) * 100:.1f}% ({fib['level_terdekat']['harga']:,})",
    ]
    return "\n".join(lines)


def _fmt_sr(sr: dict) -> str:
    if not sr["tersedia"]:
        return f"Data tidak tersedia ({sr['alasan']})"
    lines = [f"Metode: {sr['metode']}"]
    support_txt = ", ".join(f"{v:,}" for v in sr["support_target_beli"]) if sr["support_target_beli"] else "tidak ditemukan"
    resistance_txt = (
        ", ".join(f"{v:,}" for v in sr["resistance_target_jual"]) if sr["resistance_target_jual"] else "tidak ditemukan"
    )
    lines.append(f"Target beli (support): {support_txt}")
    lines.append(f"Target jual (resistance): {resistance_txt}")
    if sr["catatan"]:
        lines.append("Catatan: " + "; ".join(sr["catatan"]))
    return "\n".join(lines)


def _fmt_candlestick(c: dict) -> str:
    if not c["tersedia"]:
        return f"Data tidak tersedia ({c['alasan']})"
    if not c["pola_terdeteksi"]:
        return "Tidak ada pola candlestick signifikan terdeteksi pada candle terakhir"
    return "\n".join(f"{p['pola']} ({p['tanggal']}, close {p['harga_close']:,})" for p in c["pola_terdeteksi"])


def _fmt_bandarmology(b: dict) -> str:
    if not b["tersedia"]:
        return f"Data tidak tersedia ({b['alasan']})"
    return (
        f"⚠️ {b['label']}\n"
        f"Status: {b['status']} (akumulasi {b['hari_akumulasi']} hari, distribusi {b['hari_distribusi']} hari "
        f"dari {b['lookback_hari']} hari terakhir)\nMetode: {b['metode']}"
    )


def _fmt_fundamental(f: dict) -> str:
    if not f.get("tersedia"):
        return f"Data tidak tersedia ({f.get('alasan', '-')})"
    lines = []
    if f.get("nama_perusahaan"):
        lines.append(f["nama_perusahaan"])
    per, pbv, mc = f["per"], f["pbv"], f["market_cap"]
    lines.append(f"PER: {per['nilai']}x" if per["tersedia"] else f"PER: Data tidak tersedia ({per['alasan']})")
    lines.append(f"PBV: {pbv['nilai']}x" if pbv["tersedia"] else f"PBV: Data tidak tersedia ({pbv['alasan']})")
    lines.append(
        f"Market Cap: Rp{mc['nilai']:,.0f}" if mc["tersedia"] else f"Market Cap: Data tidak tersedia ({mc['alasan']})"
    )
    if f.get("tanggal_laporan"):
        lines.append(f"Berdasarkan laporan keuangan per {f['tanggal_laporan']}")
    elif f.get("tanggal_laporan_catatan"):
        lines.append(f"⚠️ {f['tanggal_laporan_catatan']}")
    if f.get("sumber"):
        lines.append(f"Sumber: {f['sumber']}, diambil {f.get('diambil_pada', '-')}")
    return "\n".join(lines)


def format_analisa(result: dict) -> dict:
    """Return dict siap dibungkus jadi Discord Embed: title, deskripsi, fields, footer."""
    ticker = result["ticker"]

    if not result.get("tersedia"):
        return {
            "title": f"📊 {ticker}",
            "deskripsi": f"❌ Data tidak tersedia: {result['alasan']}",
            "fields": [],
            "footer": DISCLAIMER,
        }

    harga_line = (
        f"Harga: Rp{result['harga_terkini']:,.0f} (per {result['tanggal_data_terakhir']} — "
        f"sumber: {result['sumber_harga']}, diambil {result['harga_diambil_pada']})"
    )
    catatan_scope = "ℹ️ Fase 1: indikator ditampilkan per-komponen. Skor & sinyal gabungan menyusul di Fase 2."

    fields = [
        ("Trend & Moving Average", _fmt_ma(result["moving_average"])),
        ("RSI", _fmt_rsi(result["rsi"])),
        ("ADX", _fmt_adx(result["adx"])),
        ("Volume", _fmt_volume(result["volume"])),
        ("Fibonacci", _fmt_fibonacci(result["fibonacci"])),
        ("Support/Resistance", _fmt_sr(result["support_resistance"])),
        ("Candlestick", _fmt_candlestick(result["candlestick"])),
        ("Estimasi Akumulasi/Distribusi", _fmt_bandarmology(result["bandarmology"])),
        ("Fundamental", _fmt_fundamental(result["fundamental"])),
    ]

    return {
        "title": f"📊 {ticker}",
        "deskripsi": f"{harga_line}\n{catatan_scope}",
        "fields": fields,
        "footer": DISCLAIMER,
    }


def format_watchlist(rows: list) -> str:
    """rows: hasil dari storage.db.get_all_latest()."""
    if not rows:
        return "Watchlist masih kosong / belum ada data ter-cache. Jalankan update harian dulu."

    lines = [f"📋 Watchlist ({len(rows)} saham) — data hasil update terakhir\n"]
    for r in rows:
        payload = r["payload"]
        if not payload.get("tersedia", True):
            lines.append(f"{r['ticker']}: ❌ Data tidak tersedia ({payload.get('alasan', '-')})")
            continue
        harga = payload.get("harga_terkini")
        rsi = payload.get("rsi", {})
        rsi_txt = f"RSI {rsi['nilai']} ({rsi['status']})" if rsi.get("tersedia") else "RSI n/a"
        band = payload.get("bandarmology", {})
        band_txt = band.get("status", "n/a") if band.get("tersedia") else "n/a"
        lines.append(f"{r['ticker']}: Rp{harga:,.0f} per {r['tanggal_data']} | {rsi_txt} | {band_txt}")

    lines.append(f"\n{DISCLAIMER}")
    return "\n".join(lines)
