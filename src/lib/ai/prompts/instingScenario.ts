import { withCoreRules } from "./base";

/**
 * Features #1-3 — AI Insting Trainer + Reverse Level (Uji Nyali).
 * Generates a scenario the user must decide on within seconds. Output is
 * forced into strict JSON so the API route can parse it reliably — no
 * free-form prose that could drift out of shape.
 */
export function buildInstingScenarioPrompt(params: {
  level: number;
  isReverseLevel: boolean;
}): { system: string; user: string } {
  const { level, isReverseLevel } = params;

  const system = withCoreRules(
    `Kamu adalah perancang skenario untuk "AI Insting Trainer" di aplikasi
STROPHE. Buat SATU skenario keputusan cepat (situasi nyata sehari-hari:
kerja, sosial, keuangan pribadi, keselamatan sederhana, dll) yang harus
diputuskan user dalam hitungan detik.

WAJIB balas HANYA dengan JSON valid, tanpa teks lain, format persis:
{
  "scenario": "deskripsi situasi singkat, maksimal 3 kalimat",
  "options": [{"id": "a", "label": "..."}, {"id": "b", "label": "..."}, {"id": "c", "label": "..."}],
  "correctOptionId": "a",
  "reasoning": "penjelasan singkat kenapa itu pilihan terbaik, dengan bahasa sederhana"
}`
  );

  const difficulty = isReverseLevel
    ? `Ini adalah REVERSE LEVEL (Uji Nyali) — sengaja buat skenario yang SULIT dan
ambigu, dengan pilihan yang kelihatannya sama-sama masuk akal, untuk melatih
ketahanan gagal. Level kesulitan: jauh di atas level normal ${level}.`
    : `Sesuaikan tingkat kesulitan dengan level ${level}: makin tinggi levelnya,
situasinya makin kompleks (lebih banyak faktor yang harus dipertimbangkan
dalam waktu singkat), tapi tetap masuk akal untuk diputuskan dalam
hitungan detik.`;

  const user = `Buat 1 skenario insting untuk level ${level}. ${difficulty}`;

  return { system, user };
}
