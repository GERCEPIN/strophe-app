"""ESTIMASI Akumulasi/Distribusi (bandarmology proksi volume). Lihat METHODOLOGY.md §6.2.

PENTING: Ini BUKAN bandarmology sejati (bukan data broker summary/foreign flow).
Ini adalah proksi berbasis volume + price action, sesuai keputusan Fase 0 (data
broker berbayar tidak tersedia). Label "ESTIMASI" WAJIB selalu disertakan di
setiap output yang memakai modul ini — lihat Aturan §1.4 & §6.2 prompt master.

Metode (didokumentasikan, bisa diaudit):
1. Ambil `lookback_days` bar terakhir.
2. Hitung rata-rata volume window tersebut.
3. Setiap hari diklasifikasi:
   - "hari akumulasi" jika close naik dari hari sebelumnya DAN volume > rata-rata window
   - "hari distribusi" jika close turun dari hari sebelumnya DAN volume > rata-rata window
   - selain itu netral (tidak dihitung)
4. selisih = jumlah hari akumulasi - jumlah hari distribusi.
5. Threshold: selisih >= NET_DAYS_THRESHOLD -> "Estimasi Akumulasi",
   selisih <= -NET_DAYS_THRESHOLD -> "Estimasi Distribusi", selain itu -> "Netral/Campur".
"""

import pandas as pd

DEFAULT_LOOKBACK_DAYS = 20
NET_DAYS_THRESHOLD = 3

METODE_PENJELASAN = (
    "ESTIMASI berbasis volume + price action (bukan data broker summary/foreign flow asli). "
    "Hari 'akumulasi' = harga naik & volume di atas rata-rata window; "
    "hari 'distribusi' = harga turun & volume di atas rata-rata window. "
    "Selisih jumlah hari akumulasi vs distribusi menentukan status."
)


def estimasi_akumulasi_distribusi(df: pd.DataFrame, lookback_days: int = DEFAULT_LOOKBACK_DAYS) -> dict:
    n = len(df)
    if n < lookback_days + 1:
        return {
            "tersedia": False,
            "alasan": f"histori data hanya {n} hari bursa, butuh minimal {lookback_days + 1} hari",
        }

    window = df.tail(lookback_days + 1).copy()
    window["prev_close"] = window["Close"].shift(1)
    window = window.iloc[1:]

    avg_volume = window["Volume"].mean()
    if avg_volume == 0:
        return {"tersedia": False, "alasan": "rata-rata volume window bernilai nol, kemungkinan saham suspend/tidak likuid"}

    hari_akumulasi = int(((window["Close"] > window["prev_close"]) & (window["Volume"] > avg_volume)).sum())
    hari_distribusi = int(((window["Close"] < window["prev_close"]) & (window["Volume"] > avg_volume)).sum())
    selisih = hari_akumulasi - hari_distribusi

    if selisih >= NET_DAYS_THRESHOLD:
        status = "Estimasi Akumulasi"
    elif selisih <= -NET_DAYS_THRESHOLD:
        status = "Estimasi Distribusi"
    else:
        status = "Netral/Campur"

    return {
        "tersedia": True,
        "label": "ESTIMASI Akumulasi/Distribusi (berbasis volume — data broker summary tidak tersedia)",
        "status": status,
        "hari_akumulasi": hari_akumulasi,
        "hari_distribusi": hari_distribusi,
        "selisih_hari": selisih,
        "lookback_hari": lookback_days,
        "metode": METODE_PENJELASAN,
    }
