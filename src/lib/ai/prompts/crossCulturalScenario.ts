import { withCoreRules } from "./base";

export const CULTURAL_CONTEXTS = [
  { id: "jepang", label: "Jepang — budaya hierarki & kolektivisme tinggi" },
  { id: "jerman", label: "Jerman — budaya direktif, efisiensi, aturan ketat" },
  { id: "arab_saudi", label: "Arab Saudi — budaya kehormatan & etika bisnis Islam" },
  { id: "brasil", label: "Brasil — budaya relasional, fleksibel, spontan" },
  { id: "india", label: "India — budaya diversitas, hierarki, negosiasi" },
  { id: "nigeria", label: "Nigeria — budaya komunal, senior dihormati, kepercayaan personal dulu" },
  { id: "skandinavia", label: "Skandinavia — egalitarianisme, konsensus, work-life balance ketat" },
  { id: "tiongkok", label: "Tiongkok — budaya mianzi (muka), guanxi, kolektivisme" },
] as const;

export type CulturalContextId = typeof CULTURAL_CONTEXTS[number]["id"];

export function buildCrossCulturalScenarioPrompt(params: {
  level: number;
  culturalContextId: CulturalContextId;
}): { system: string; user: string } {
  const { level, culturalContextId } = params;
  const context = CULTURAL_CONTEXTS.find((c) => c.id === culturalContextId)!;

  const system = withCoreRules(
    `Kamu adalah perancang skenario untuk "Skenario Lintas Budaya" di aplikasi
STROPHE. Buat SATU skenario keputusan nyata yang SPESIFIK terjadi dalam
konteks budaya yang diberikan — bukan skenario generik yang kebetulan diberi
label budaya. Skenarionya harus mencerminkan norma, nilai, atau ekspektasi
budaya tersebut sehingga pilihan yang "benar" mungkin BERBEDA dari yang
intuitif orang Indonesia pada umumnya.

Tujuan: melatih user memahami bahwa keputusan yang sama bisa salah atau
benar tergantung konteks budaya.

WAJIB balas HANYA dengan JSON valid, tanpa teks lain, format persis:
{
  "scenario": "deskripsi situasi singkat, maksimal 3 kalimat, sudah sertakan konteks budayanya",
  "options": [{"id": "a", "label": "..."}, {"id": "b", "label": "..."}, {"id": "c", "label": "..."}],
  "correctOptionId": "a",
  "reasoning": "penjelasan singkat kenapa itu pilihan terbaik DALAM KONTEKS BUDAYA INI, dengan bahasa sederhana — boleh kontraskan dengan norma Indonesia"
}`
  );

  const user = `Buat 1 skenario lintas budaya untuk level ${level}.
Konteks budaya: ${context.label}.
Tingkat kesulitan: level ${level} (makin tinggi level, makin halus dan ambigu nuansa budayanya).`;

  return { system, user };
}
