import { withCoreRules } from "./base";

export function buildRealLifeMissionPrompt(params: {
  currentLevel: number;
  isZonaNyamanBreaker: boolean;
  recentMissions?: string[];
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu generate satu misi nyata di dunia nyata untuk user aplikasi STROPHE yang
sedang di level ${params.currentLevel}. Misi harus konkret, bisa dikerjakan
dalam 1-3 hari, dan relevan dengan pengembangan diri.

${
  params.isZonaNyamanBreaker
    ? "Ini misi ZONA NYAMAN BREAKER — misi harus membuat user keluar dari zona nyaman: lakukan sesuatu yang belum pernah dilakukan, ajak bicara orang baru, atau hadapi situasi yang biasanya dihindari. Tetap aman dan legal."
    : "Ini misi reguler — fokus pada konsistensi dan latihan skill spesifik."
}

Output: satu kalimat misi saja, tidak lebih. Mulai dengan kata kerja (Kunjungi..., Hubungi..., Coba..., Tuliskan..., dsb). Jangan tambahkan penjelasan panjang.`
  );

  const user = `Buat misi untuk user level ${params.currentLevel}. ${
    params.recentMissions?.length
      ? "Misi yang sudah pernah diberikan (hindari yang terlalu mirip): " + params.recentMissions.join("; ")
      : ""
  }`;

  return { system, user };
}
