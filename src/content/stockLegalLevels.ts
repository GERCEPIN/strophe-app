/**
 * Akademi Analisis Saham → Kategori Legal & Compliance, Level 1-5.
 *
 * Konten ini bersifat edukatif umum tentang regulasi pasar modal Indonesia.
 * Bukan konsultasi hukum. Untuk kebutuhan legal spesifik, konsultasikan
 * dengan konsultan hukum atau konsultan keuangan berlisensi.
 */

import { StockLessonSeed } from "./stockFundamentalLevels";

export const STOCK_LEGAL_LEVELS: StockLessonSeed[] = [
  {
    level: 1,
    title: "Regulasi Pasar Modal Indonesia",
    analogy:
      "OJK = wasit pasar modal — memastikan permainan fair untuk semua.",
    contentMarkdown: `Pasar modal Indonesia diatur oleh beberapa institusi yang memiliki fungsi berbeda:

**OJK (Otoritas Jasa Keuangan)**
Regulator independen yang mengawasi seluruh sektor jasa keuangan Indonesia, termasuk pasar modal, perbankan, dan asuransi. OJK menetapkan peraturan, mengawasi kepatuhan, dan menindak pelanggaran.

**BEI (Bursa Efek Indonesia / IDX)**
Bursa saham resmi Indonesia, tempat efek (saham, obligasi, reksa dana, dll) diperdagangkan. BEI menetapkan aturan pencatatan emiten, jam perdagangan, dan prosedur suspensi saham.

**KSEI (Kustodian Sentral Efek Indonesia)**
Lembaga yang menyimpan dan mengelola pencatatan kepemilikan efek secara elektronik. Saat kamu membeli saham, kepemilikanmu tercatat di KSEI melalui perusahaan sekuritas (broker) yang kamu gunakan.

**Rantai ekosistem:**
Investor → Perusahaan Sekuritas (Broker, anggota BEI) → BEI → KSEI → OJK (pengawas)

**Mengapa ini penting untuk investor?**
- Pastikan broker yang kamu gunakan terdaftar dan berizin di OJK.
- Seluruh transaksi saham di BEI harus melalui broker berizin.
- OJK memiliki portal pengaduan dan blacklist perusahaan investasi ilegal — selalu cek sebelum berinvestasi.

**Sumber informasi resmi:**
- ojk.go.id
- idx.co.id
- ksei.co.id`,
  },
  {
    level: 2,
    title: "Laporan Keuangan Wajib & Keterbukaan Informasi",
    analogy:
      "Keterbukaan informasi = perusahaan wajib 'membuka buku' secara berkala.",
    contentMarkdown: `Salah satu pilar utama pasar modal yang sehat adalah **keterbukaan informasi** (disclosure) — prinsip bahwa semua informasi material tentang emiten harus tersedia untuk semua pelaku pasar secara bersamaan.

**Kewajiban pelaporan emiten:**

**1. Laporan Keuangan Kuartalan**
Emiten wajib menyampaikan laporan keuangan setiap kuartal (Q1, Q2, Q3) dalam waktu tertentu setelah akhir periode. Laporan kuartalan tidak wajib diaudit.

**2. Laporan Keuangan Tahunan**
Laporan keuangan tahunan (akhir tahun fiskal) wajib diaudit oleh akuntan publik independen yang terdaftar di OJK. Audit memberikan tingkat keyakinan yang lebih tinggi atas keakuratan angka.

**3. Keterbukaan Informasi Material**
Emiten wajib segera mengumumkan informasi yang material (yang berpotensi mempengaruhi keputusan investor) seperti: akuisisi besar, perubahan direksi, gugatan hukum material, kontrak besar, dll.

**Cara mengakses:**
Semua keterbukaan informasi emiten BEI tersedia publik di: **idx.co.id → Perusahaan Tercatat → Keterbukaan Informasi**

**Yang perlu diperhatikan investor:**
- Laporan yang diaudit memberikan kepastian lebih tinggi dari yang tidak diaudit.
- Selalu baca catatan kaki laporan keuangan — informasi penting sering tersembunyi di sana.
- Cek konsistensi antar laporan dari waktu ke waktu.

⚠️ Ini adalah edukasi umum. Untuk interpretasi laporan keuangan spesifik, pertimbangkan konsultasi dengan analis atau konsultan keuangan berlisensi.`,
  },
  {
    level: 3,
    title: "Insider Trading & Manipulasi Pasar",
    analogy:
      "Bermain kartu tapi kamu lihat kartu orang lain — itu curang dan ilegal.",
    contentMarkdown: `**Insider Trading**
Insider trading adalah transaksi efek berdasarkan **informasi material yang belum dipublikasikan** (non-public information). Contoh: seorang direktur perusahaan membeli saham perusahaannya sendiri sebelum pengumuman akuisisi besar yang akan mendorong harga naik.

Ini ilegal karena:
- Melanggar prinsip kesetaraan akses informasi.
- Merugikan investor lain yang tidak memiliki informasi tersebut.
- Merusak kepercayaan terhadap pasar modal.

**Di Indonesia**, insider trading diatur dalam UU Pasar Modal dan dapat dikenai sanksi pidana dan/atau perdata oleh OJK.

**Manipulasi Pasar**
Tindakan yang secara artifisial mempengaruhi harga atau volume perdagangan efek untuk tujuan tertentu:
- **Pump & Dump** — beli banyak untuk menaikkan harga, sebarkan info menyesatkan, jual di harga tinggi.
- **Wash Trading** — beli dan jual efek yang sama secara koordinasi untuk menciptakan kesan volume yang aktif.
- **Cornering** — mengontrol supply efek untuk memaksa harga naik.

Semua tindakan ini ilegal dan dapat dikenai sanksi berat.

**Sebagai investor:**
- Kalau mendapat "tips" saham dari orang dalam yang belum dipublikasikan — berhati-hati, menggunakan informasi itu bisa menempatkanmu dalam posisi hukum yang riskan.
- Laporkan dugaan manipulasi pasar ke OJK: ojk.go.id atau konsumenojk.ojk.go.id.

⚠️ Modul ini adalah edukasi umum. Untuk pertanyaan hukum spesifik, konsultasikan dengan pengacara yang berpengalaman di pasar modal.`,
  },
  {
    level: 4,
    title: "Prospektus & IPO",
    analogy:
      "Prospektus = CV lengkap perusahaan sebelum minta kamu investasi.",
    contentMarkdown: `**IPO (Initial Public Offering)** adalah proses pertama kali saham perusahaan ditawarkan ke publik dan dicatatkan di bursa. Sebelum IPO, perusahaan masih bersifat privat (tidak diperdagangkan di bursa).

**Prospektus:**
Dokumen hukum yang wajib diterbitkan oleh perusahaan saat IPO (atau penawaran umum lainnya). Prospektus berisi semua informasi material yang dibutuhkan investor untuk membuat keputusan investasi.

**Isi utama prospektus:**
1. **Profil perusahaan** — sejarah, bisnis, model pendapatan.
2. **Laporan keuangan historis** — biasanya 2-3 tahun terakhir, diaudit.
3. **Penggunaan dana hasil IPO** — ini penting! Untuk apa uang dari investor akan dipakai?
4. **Faktor risiko** — daftar risiko yang diakui sendiri oleh perusahaan. Baca bagian ini dengan serius.
5. **Informasi manajemen** — rekam jejak direksi dan komisaris.
6. **Struktur kepemilikan** — siapa pemegang saham utama sebelum dan sesudah IPO?

**Yang perlu diperhatikan saat membaca prospektus:**
- Apakah penggunaan dana IPO untuk ekspansi bisnis (baik), atau untuk membayar utang pemegang saham lama (perlu dicermati)?
- Seberapa transparan perusahaan menjelaskan risiko bisnisnya?
- Apakah ada lock-up period (periode di mana pemegang saham lama tidak boleh menjual)?

**Di mana menemukan prospektus?**
idx.co.id → Perusahaan Tercatat → Prospektus

⚠️ IPO tidak selalu berarti harga akan naik setelah listing. Banyak saham IPO yang turun di bawah harga IPO-nya.`,
  },
  {
    level: 5,
    title: "Hak & Kewajiban Pemegang Saham",
    analogy:
      "Pemegang saham = co-owner perusahaan, dengan hak suara proporsional.",
    contentMarkdown: `Saat kamu membeli saham sebuah perusahaan terbuka (Tbk), kamu menjadi salah satu pemilik perusahaan tersebut — meski kepemilikanmu mungkin sangat kecil.

**Hak pemegang saham:**

**1. Hak atas Dividen**
Kalau perusahaan membagikan dividen, kamu berhak mendapat bagian proporsional dengan jumlah saham yang dimiliki. Tidak semua perusahaan membagikan dividen setiap tahun — tergantung kebijakan dan kondisi keuangan.

**2. Hak Suara (Voting Rights)**
Di RUPS (Rapat Umum Pemegang Saham), pemegang saham bisa memberikan suara untuk keputusan-keputusan penting seperti: persetujuan laporan keuangan, perubahan direksi/komisaris, aksi korporasi besar. Satu saham umumnya = satu suara (kecuali ada kelas saham berbeda).

**3. Hak atas Informasi**
Pemegang saham berhak mendapatkan informasi material tentang perusahaan melalui keterbukaan informasi yang dipublikasikan.

**4. Hak atas Aset Sisa (Saat Likuidasi)**
Kalau perusahaan dibubarkan, pemegang saham berhak atas sisa aset setelah semua kewajiban (utang) dilunasi. Dalam praktiknya, pada kebangkrutan, sering tidak ada sisa untuk pemegang saham.

**RUPS:**
Ada dua jenis: RUPS Tahunan (wajib, membahas laporan keuangan dan kinerja) dan RUPS Luar Biasa (untuk keputusan khusus yang memerlukan persetujuan pemegang saham).

**Kewajiban pemegang saham:**
Secara hukum, pemegang saham minoritas di perusahaan terbuka tidak memiliki kewajiban tambahan di luar nilai saham yang dibeli. Liability terbatas pada modal yang disetorkan.

⚠️ Hak-hak di atas tunduk pada hukum dan peraturan yang berlaku serta anggaran dasar perusahaan masing-masing.`,
  },
];
