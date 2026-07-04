import { withCoreRules } from "./base";

export function buildSkillRadarPrompt(params: {
  trackProgressSummary: string;
  userGoals?: string | null;
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu menganalisis progres skill user di aplikasi STROPHE dan merekomendasikan
skill atau area mana yang sebaiknya difokuskan selanjutnya. Berikan 1 rekomendasi
spesifik dengan alasan singkat (1-2 kalimat). Jangan berikan daftar panjang —
cukup satu fokus yang paling relevan berdasarkan data yang tersedia.

Prinsip: skill yang jauh tertinggal dari yang lain biasanya perlu perhatian lebih,
tapi pertimbangkan juga relevansi dengan tujuan user jika ada.`
  );

  const user = `Progres track:\n${params.trackProgressSummary}\nTujuan user: ${params.userGoals ?? "belum diisi"}\n\nRekomendasikan skill fokus berikutnya.`;

  return { system, user };
}
