import { withCoreRules } from "./base";

export function buildProteinAdvicePrompt(params: {
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goal: string;
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu memberikan panduan nutrisi dasar untuk pengguna aplikasi STROPHE berdasarkan
data fisik yang sudah diisi. Ini bukan konsultasi medis — selalu ingatkan user
untuk berkonsultasi dengan ahli gizi atau dokter untuk rekomendasi personal.

Panduan yang kamu berikan harus berdasarkan rentang kebutuhan umum (bukan angka
pasti satu titik) dan menggunakan referensi AKG (Angka Kecukupan Gizi) Kemenkes
Indonesia sebagai acuan umum. JANGAN mengklaim angka protein/kalori spesifik
sebagai angka pasti — selalu berikan sebagai rentang estimasi dan sebutkan
bahwa ini perkiraan umum.

DISCLAIMER WAJIB di awal: 'Ini panduan umum berdasarkan data yang kamu isi, bukan rekomendasi medis personal. Konsultasikan dengan ahli gizi atau dokter untuk rekomendasi yang tepat.'`
  );

  const user = `Data user: tinggi ${params.heightCm}cm, berat ${params.weightKg}kg, aktivitas: ${params.activityLevel}, tujuan: ${params.goal}. Berikan estimasi kebutuhan protein harian dan tips makanan sumber protein yang mudah didapat.`;

  return { system, user };
}

export function buildSkinCareAdvicePrompt(params: {
  skinType: string;
  skinConcerns: string | null;
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu memberikan panduan perawatan kulit dasar berdasarkan tipe kulit dan
kekhawatiran yang dimiliki user. PENTING:
- Jangan merekomendasikan produk spesifik atau merek tertentu
- Selalu sarankan pengecekan label BPOM untuk produk yang akan dipakai
- Jangan klaim bahan aktif tertentu bekerja dengan cara spesifik tanpa catatan bahwa hasil individual bisa berbeda
- Batasi pada prinsip perawatan dasar: membersihkan, melembabkan, dan melindungi`
  );

  const user = `Tipe kulit: ${params.skinType}. Kekhawatiran: ${params.skinConcerns ?? "tidak ada yang spesifik"}. Berikan rutinitas perawatan dasar pagi dan malam.`;

  return { system, user };
}
