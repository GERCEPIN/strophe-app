/**
 * Akademi Analisis Saham → Kategori Manajemen Risiko, Level 1-5.
 *
 * Semua angka/persentase adalah ILUSTRASI — bukan rekomendasi finansial.
 */

import { StockLessonSeed } from "./stockFundamentalLevels";

export const STOCK_RISK_LEVELS: StockLessonSeed[] = [
  {
    level: 1,
    title: "Apa Itu Risiko Investasi?",
    analogy:
      "Risiko bukan sesuatu yang harus dihindari, tapi diukur dan dikelola — seperti mengemudi: ada risiko, tapi bisa dikurangi dengan sabuk pengaman.",
    contentMarkdown: `Dalam investasi, **risiko** adalah kemungkinan bahwa hasil aktual berbeda dari yang diharapkan — termasuk kemungkinan kehilangan sebagian atau seluruh modal.

**Dua kategori risiko utama:**

**1. Risiko Sistematis (Systematic Risk)**
Risiko yang memengaruhi seluruh pasar atau ekonomi — tidak bisa dihilangkan dengan diversifikasi:
- Resesi ekonomi
- Kenaikan suku bunga
- Krisis geopolitik
- Pandemi

Semua saham cenderung terdampak, meski dalam derajat yang berbeda.

**2. Risiko Tidak Sistematis (Unsystematic Risk)**
Risiko yang spesifik pada satu perusahaan atau sektor:
- Manajemen yang buruk
- Skandal korupsi di emiten
- Produk gagal di pasar
- Perubahan regulasi yang hanya mempengaruhi satu industri

Risiko ini **bisa dikurangi** dengan diversifikasi portofolio.

**Hubungan risiko dan return:**
Secara umum, potensi return yang lebih tinggi datang dengan risiko yang lebih tinggi. Tidak ada instrumen investasi yang memberikan return tinggi dengan risiko nol — kalau ada yang mengklaim demikian, waspadai penipuan.

**Yang perlu kamu tanyakan pada diri sendiri:**
- Berapa persen dari total asetmu yang siap kamu investasikan di saham?
- Berapa persen kerugian yang masih bisa kamu toleransi secara emosional dan finansial?

⚠️ Modul ini adalah edukasi, bukan rekomendasi finansial. Konsultasikan keputusan investasi besar dengan konsultan keuangan berlisensi.`,
  },
  {
    level: 2,
    title: "Diversifikasi: Jangan Taruh Semua Telur di Satu Keranjang",
    analogy:
      "Diversifikasi mengurangi risiko tidak sistematis — tapi tidak bisa menghapus risiko sistematis.",
    contentMarkdown: `**Diversifikasi** adalah strategi menyebarkan investasi ke berbagai aset, sektor, atau instrumen untuk mengurangi dampak kerugian pada satu investasi terhadap portofolio keseluruhan.

**Bagaimana diversifikasi bekerja:**
Kalau kamu menyimpan 100% portofolio di satu saham dan saham itu turun 50% (ILUSTRASI), portofoliomu turun 50%. Tapi kalau kamu menyebar di 10 saham berbeda dan satu turun 50%, dampaknya hanya 5% dari portofolio total (asumsi distribusi merata — ILUSTRASI).

**Dimensi diversifikasi:**
1. **Lintas emiten** — jangan hanya pegang 1-2 saham.
2. **Lintas sektor** — hindari konsentrasi di satu industri saja.
3. **Lintas aset** — gabungkan saham dengan obligasi, reksa dana, atau instrumen lain sesuai profil risiko.
4. **Lintas waktu (Dollar Cost Averaging)** — beli secara berkala, bukan sekaligus, untuk mengurangi risiko timing yang buruk.

**Batasan diversifikasi:**
- Diversifikasi tidak menghilangkan risiko sistematis — saat krisis, hampir semua saham turun bersama.
- Terlalu banyak diversifikasi (over-diversification) juga bisa menyulitkan pemantauan dan mengurangi potensi return.

**Contoh portofolio terdiversifikasi (ILUSTRASI — bukan rekomendasi):**
Sektor consumer staples, sektor perbankan, sektor infrastruktur, dan sebagian reksa dana pasar uang — ini hanya contoh cara berpikir, bukan anjuran alokasi spesifik.

⚠️ Alokasi investasi yang tepat sangat individual. Konsultasikan dengan konsultan keuangan berlisensi untuk situasimu.`,
  },
  {
    level: 3,
    title: "Position Sizing & Batas Risiko Per Saham",
    analogy:
      "Jangan pertaruhkan lebih dari yang kamu sanggup rugi — kalau saham ini jadi nol, seberapa besar dampaknya ke total portofoliomu?",
    contentMarkdown: `**Position sizing** adalah menentukan berapa besar dana yang dialokasikan untuk satu posisi saham relatif terhadap total portofolio.

**Mengapa ini penting?**
Bahkan investor yang paling akurat analisisnya pun kadang salah. Position sizing memastikan bahwa satu kesalahan tidak menghancurkan seluruh portofolio.

**Pendekatan umum (ILUSTRASI — bukan rekomendasi):**
Beberapa investor ritel menggunakan aturan seperti: tidak menempatkan lebih dari X% total portofolio di satu saham. Angka X bervariasi tergantung profil risiko masing-masing — ini harus kamu tentukan sendiri berdasarkan situasimu.

**Pertanyaan kunci sebelum membeli:**
1. Kalau saham ini turun 50% (ILUSTRASI), berapa kerugianku dalam rupiah?
2. Kalau saham ini jadi nol (kebangkrutan emiten), berapa persen portofolio totalku yang hilang?
3. Apakah aku masih bisa tidur nyenyak dengan posisi sebesar ini?

**Risiko konsentrasi:**
Konsentrasi tinggi di satu saham (misalnya 50% portofolio di satu emiten — ILUSTRASI) berarti satu berita buruk tentang emiten itu bisa memberi dampak sangat besar. Ini bukan berarti konsentrasi selalu salah — tapi harus disadari dan disengaja.

⚠️ Semua persentase di sini ILUSTRASI. Batas risiko yang tepat sangat individual dan bergantung pada kondisi finansial, tujuan, dan toleransi risiko masing-masing.`,
  },
  {
    level: 4,
    title: "Cut Loss: Kapan Harus Keluar?",
    analogy:
      "Cut loss bukan kalah — itu stop bleeding sebelum luka jadi lebih dalam.",
    contentMarkdown: `**Cut loss** adalah keputusan menjual saham yang sudah turun untuk membatasi kerugian lebih lanjut.

**Mengapa cut loss sulit secara psikologis?**
- **Loss aversion** — secara psikologis, rasa sakit karena rugi lebih besar dari kesenangan karena untung yang setara.
- **Gengsi dan ego** — mengakui salah terasa berat.
- **Hope bias** — "pasti nanti naik lagi" tanpa dasar analisis baru.
- **Survivorship bias** — kita lebih ingat cerita saham yang akhirnya rebound, dan melupakan saham yang terus turun dan tidak pernah pulih.

**Prinsip cut loss yang sehat:**
1. Tentukan batas cut loss **sebelum membeli**, bukan setelah rugi. Contoh ilustrasi: "Kalau turun lebih dari Y%, aku akan jual dan re-evaluasi."
2. Dasarkan keputusan pada perubahan **fundamental**, bukan hanya pergerakan harga. Kalau fundamental masih bagus dan harga turun karena sentimen, mungkin ini bukan saatnya cut loss. Kalau fundamental memburuk, pertimbangkan keluar lebih awal.
3. Bedakan antara **koreksi** (penurunan sementara dalam tren naik yang masih valid) dan **reversal** (pembalikan tren yang fundamental).

**Yang perlu dihindari:**
- Averaging down (membeli lebih banyak saat rugi) tanpa analisis fundamental yang solid dan portofolio yang mampu menanggungnya.
- Berpegang pada saham yang fundamentalnya sudah berubah buruk hanya karena berharap harga kembali ke harga beli.

⚠️ Ini adalah framework edukasi, bukan rekomendasi finansial. Keputusan cut loss yang tepat sangat bergantung pada situasi individual.`,
  },
  {
    level: 5,
    title: "Portofolio Review & Rebalancing",
    analogy:
      "Portofolio seperti tanaman — perlu dicek dan dipangkas secara berkala.",
    contentMarkdown: `**Portofolio Review** adalah proses mengevaluasi secara berkala apakah komposisi portofoliomu masih sesuai dengan tujuan investasi dan profil risikomu.

**Mengapa review berkala penting?**
Portofolio yang tidak pernah di-review bisa "drift" — misalnya saham yang naik pesat menjadi terlalu dominan, meningkatkan konsentrasi risiko yang tidak kamu rencanakan.

**Contoh drift (ILUSTRASI — bukan data nyata):**
Awalnya alokasi portofolio: 40% saham A, 40% saham B, 20% obligasi (ILUSTRASI). Setelah setahun saham A naik 100%, komposisinya berubah menjadi: ~55% saham A, ~35% saham B, ~10% obligasi (ILUSTRASI). Risiko konsentrasi meningkat tanpa kamu sadari.

**Rebalancing:**
Proses mengembalikan komposisi portofolio ke alokasi target — biasanya dengan menjual aset yang sudah terlalu dominan dan membeli aset yang underweight.

**Frekuensi review:**
Tidak ada aturan baku. Beberapa praktisi melakukan review kuartalan, sebagian lagi semesteran. Yang penting adalah konsisten dan berbasis analisis, bukan reaktif terhadap pergerakan harga harian.

**Yang dipertimbangkan saat review:**
1. Apakah fundamental emiten masih sesuai ekspektasi saat dibeli?
2. Apakah kondisi industri/makro berubah signifikan?
3. Apakah ada perubahan tujuan finansial atau toleransi risiko pribadi?
4. Apakah ada posisi yang terlalu besar (over-concentrated)?

⚠️ Semua angka dan persentase ILUSTRASI. Review dan rebalancing yang tepat memerlukan pemahaman situasi keuangan pribadimu secara menyeluruh.`,
  },
];
