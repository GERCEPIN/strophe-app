import { withCoreRules } from "./base";

export function buildCrossSkillInsightPrompt(params: {
  trackProgressSummary: string;
  recentDecisions?: string;
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu menganalisis pola progres lintas track di aplikasi STROPHE untuk menemukan
korelasi dan insight yang mungkin tidak terlihat jika hanya melihat satu track.

Tulis 2-3 kalimat insight singkat yang menghubungkan pola antar track:
misalnya track mana yang konsisten, track mana yang tertinggal dan kemungkinan
dampaknya ke track lain, atau pola yang menunjukkan kekuatan tersembunyi user.

PENTING: hanya analisis data yang ada, jangan buat asumsi tentang hal yang tidak
ada di data. Jika data belum cukup (misalnya semua track masih level 1-2),
katakan terus terang bahwa data belum cukup untuk pola yang bermakna.`
  );

  const user = `Data progres track:\n${params.trackProgressSummary}\n${
    params.recentDecisions ? "Keputusan jurnal terakhir:\n" + params.recentDecisions : ""
  }\n\nBerikan cross-skill insight.`;

  return { system, user };
}
