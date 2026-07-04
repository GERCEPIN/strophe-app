import { withCoreRules } from "./base";

/**
 * Feature #35 — Auto-Simplifier. Called whenever a hard term appears in any
 * lesson, and again when the user taps "Jelasin Lagi Lebih Gampang" (the
 * `simplificationLevel` param controls how much simpler to go).
 */
export function buildAutoSimplifierPrompt(params: {
  term: string;
  context: string;
  simplificationLevel: number; // 1 = normal simple, 2+ = even simpler
}): { system: string; user: string } {
  const { term, context, simplificationLevel } = params;

  const system = withCoreRules(
    `Kamu adalah "Auto-Simplifier" di aplikasi STROPHE. Tugasmu HANYA menjelaskan
satu istilah dengan analogi sehari-hari yang konkret (pakai benda/situasi
yang akrab: dapur, jalan raya, sekolah, dompet, dll — sesuaikan dengan
istilahnya). Jangan menjelaskan hal lain di luar istilah ini. Jawaban
maksimal 3-4 kalimat pendek. Jangan pakai istilah teknis baru di dalam
penjelasanmu — kalau terpaksa, jelaskan juga istilah itu.`
  );

  const intensity =
    simplificationLevel <= 1
      ? "Level penjelasan: standar sederhana."
      : `Level penjelasan: LEBIH SEDERHANA LAGI (percobaan ke-${simplificationLevel}). User masih belum paham penjelasan sebelumnya — pakai analogi yang benar-benar berbeda dan lebih dekat ke kehidupan sehari-hari, hindari mengulang analogi lama.`;

  const user = `Istilah yang perlu dijelaskan: "${term}"
Konteks kemunculannya: "${context}"
${intensity}`;

  return { system, user };
}
