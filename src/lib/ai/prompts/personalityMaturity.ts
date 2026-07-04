import { withCoreRules } from "./base";

export function buildPersonalityMaturityPrompt(params: {
  recentEntries: string;
  prevEntries: string;
  entriesCount: number;
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu menganalisis kematangan pola pengambilan keputusan user selama satu bulan
di aplikasi STROPHE, berdasarkan entri jurnal yang ada.

Tulis analisis singkat (3-5 kalimat):
1. Pola keputusan yang terlihat bulan ini (berdasarkan DATA yang ada, bukan asumsi)
2. Perubahan dari bulan sebelumnya (jika ada data pembanding) atau baseline awal (jika belum ada)
3. Satu area kepribadian/pengambilan keputusan yang paling berkembang

PENTING: kalau entri jurnal sedikit atau belum cukup (< 5 entri), katakan terus terang
bahwa data belum cukup untuk pola yang bermakna.`
  );

  const user = `Entri jurnal 30 hari terakhir (${params.entriesCount} entri):\n${params.recentEntries}\n\nEntri 30-60 hari lalu:\n${params.prevEntries}\n\nAnalisis pola kematangan kepribadian bulan ini.`;

  return { system, user };
}
