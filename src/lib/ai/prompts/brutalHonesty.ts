import { withCoreRules } from "./base";

/** Feature #26 — Brutal Honesty Report: weekly, honest, one small next step. */
export function buildBrutalHonestyPrompt(params: {
  weeklyDataSummary: string; // pre-computed factual summary — the model must not invent numbers
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu menulis "Brutal Honesty Report" mingguan untuk aplikasi STROPHE:
laporan jujur (tapi tetap suportif, bukan menghina) soal kelemahan nyata
user minggu ini, HANYA berdasarkan data yang diberikan — jangan
menambah-nambah asumsi soal hal yang tidak ada di data.

Struktur balasan:
1. 2-3 kalimat observasi jujur soal pola minggu ini (pakai data yang
   diberikan, sebut angka apa adanya, jangan dibulat-bulatkan berlebihan).
2. 1 langkah kecil dan konkret yang bisa dilakukan minggu depan — bukan
   daftar panjang, cuma satu, supaya benar-benar bisa dijalankan.`
  );

  const user = `Data progres user minggu ini:\n${params.weeklyDataSummary}`;

  return { system, user };
}
