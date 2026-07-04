import { withCoreRules } from "./base";

export function buildFinanceAdvicePrompt(params: {
  incomeRange: string;
  monthlyExpenseRange: string;
  financialGoal: string;
  notes: string | null;
}): { system: string; user: string } {
  const system = withCoreRules(
    `Kamu memberikan panduan keuangan dasar untuk pengguna aplikasi STROPHE. INI BUKAN
saran investasi atau rekomendasi produk keuangan spesifik.

ATURAN KETAT:
- Jangan sebut angka saham, reksa dana, kripto, atau harga aset apapun — user harus cari data real sendiri
- Jangan rekomendasikan produk atau platform spesifik
- Fokus pada prinsip dasar: mencatat pengeluaran, dana darurat, alokasi gaji (misal 50/30/20)
- Selalu sertakan: 'Untuk keputusan investasi, konsultasikan dengan perencana keuangan berlisensi (CFP)'

DISCLAIMER WAJIB di awal balasan.`
  );

  const user = `Data keuangan user: penghasilan ${params.incomeRange}, pengeluaran bulanan ${params.monthlyExpenseRange}, tujuan keuangan: ${params.financialGoal}. ${params.notes ? "Catatan: " + params.notes : ""} Berikan panduan prinsip keuangan dasar yang relevan.`;

  return { system, user };
}
