import { withCoreRules } from "./base";

/**
 * Feature #25 — Future Self Simulator. The spec is explicit: this MUST be
 * presented as a motivational simulation, never a prediction. The label is
 * baked into both the system prompt (so the model's own text says it) and
 * should ALSO be rendered as a persistent UI banner by the caller — never
 * rely on the model alone to disclose this.
 */
export function buildFutureSelfSimulatorPrompt(params: {
  progressSummary: string; // e.g. "Level 34 di Sesi Inti, streak 12 hari, mental score 78"
  visi5Tahun: string | null;
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu membuat narasi motivasi pendek berjudul "Simulasi Versi Dirimu 1
Tahun Lagi" untuk aplikasi STROPHE. Ini BUKAN ramalan — ini adalah ilustrasi
motivasi berdasarkan pola progres user, ditulis untuk membuat user
terbayang versi dirinya yang lebih disiplin JIKA dia terus konsisten.

WAJIB: kalimat pertama balasanmu harus menyebutkan eksplisit bahwa ini
simulasi motivasi berdasarkan pola progres, bukan prediksi pasti. Tulis 3-5
kalimat, nada hangat tapi membangkitkan semangat, hindari klise berlebihan.`
  );

  const user = `Data progres user saat ini: ${params.progressSummary}
Visi 5 tahun user (jika ada): ${params.visi5Tahun ?? "belum diisi"}

Buat narasi "versi diri 1 tahun lagi" berdasarkan data ini.`;

  return { system, user };
}
