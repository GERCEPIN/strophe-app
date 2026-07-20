"""Kalkulasi PER, PBV, Market Cap — formula eksplisit sesuai §5 prompt master.

Fungsi murni (tidak melakukan I/O) sehingga bisa diuji tanpa jaringan. Input
adalah field mentah yang sudah diambil oleh data/fetch.py#fetch_fundamental.
Setiap metrik dievaluasi TERPISAH — kalau EPS tidak tersedia, PER ditandai
tidak tersedia tapi PBV/Market Cap tetap dihitung kalau datanya ada.
"""


def compute_fundamental(
    eps: float | None,
    bvps: float | None,
    shares_outstanding: float | None,
    harga_terkini: float | None,
    tanggal_laporan: str | None,
    tanggal_laporan_catatan: str | None,
) -> dict:
    result = {"tanggal_laporan": tanggal_laporan, "tanggal_laporan_catatan": tanggal_laporan_catatan}

    if harga_terkini is None:
        alasan_harga = "harga saham terkini tidak tersedia"
        result["per"] = {"tersedia": False, "alasan": alasan_harga}
        result["pbv"] = {"tersedia": False, "alasan": alasan_harga}
        result["market_cap"] = {"tersedia": False, "alasan": alasan_harga}
        return result

    if eps is not None and eps != 0:
        result["per"] = {"tersedia": True, "nilai": round(harga_terkini / eps, 2)}
    else:
        result["per"] = {"tersedia": False, "alasan": "EPS (trailing twelve months) tidak tersedia atau nol dari sumber data"}

    if bvps is not None and bvps != 0:
        result["pbv"] = {"tersedia": True, "nilai": round(harga_terkini / bvps, 2)}
    else:
        result["pbv"] = {"tersedia": False, "alasan": "Book Value per Share tidak tersedia atau nol dari sumber data"}

    if shares_outstanding is not None and shares_outstanding > 0:
        result["market_cap"] = {"tersedia": True, "nilai": round(harga_terkini * shares_outstanding, 0)}
    else:
        result["market_cap"] = {"tersedia": False, "alasan": "jumlah saham beredar tidak tersedia dari sumber data"}

    return result
