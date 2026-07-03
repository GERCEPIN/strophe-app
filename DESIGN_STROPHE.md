# STROPHE — "The Turning Point"
## Dokumen Rancangan Struktur & Konten Aplikasi (Lengkap)

---

# BAGIAN A — APLIKASI UTAMA STROPHE

## A1. Konsep Besar & Pesan Utama

**Asal makna, dipakai sebagai fondasi produk (bukan hiasan):**
Dalam teater Yunani kuno, *strophe* adalah momen paduan suara berbalik arah sambil melantunkan syair — satu putaran penuh sebelum lanjut ke bait berikutnya. STROPHE mengambil ide ini secara harfiah: **setiap hari pemakaian = satu "Putaran."** Bukan "level" dalam arti game, tapi satu putaran penuh dari refleksi ke tindakan ke refleksi lagi.

**Pesan utama yang dipegang di semua copy, semua layar, semua notifikasi:**
> "STROPHE tidak membuatmu jenius dalam semalam. STROPHE adalah sistem harian yang, kalau dijalani konsisten, membentuk ulang caramu berpikir, memutuskan, dan bertindak — bertahap, terukur, dan bisa dibuktikan lewat data kamu sendiri, bukan janji kosong."

**Prinsip visual/nada (arahan untuk desainer):**
- Tidak ada maskot kartun, tidak ada confetti, tidak ada bahasa "Yay! Kamu hebat!!!" — nadanya seperti *pelatih personal yang serius* dan *jurnal pribadi seorang profesional*, bukan aplikasi anak-anak.
- Motif visual progres: bukan progress bar lurus, tapi **spiral yang naik** (mengikuti makna "berputar sambil naik") — setiap putaran menambah satu lingkaran kecil di spiral.
- Warna gelap + aksen emas dipakai konsisten untuk menandai *momen penting* (Diamond Checkpoint, Reflection Level, Blueprint review) — bukan dipakai sembarangan supaya tetap terasa premium.

> **Update:** logo asli STROPHE sudah diunggah dan diintegrasikan ke aplikasi (direkolorisasi emas di atas latar gelap, sesuai token warna di atas). Filenya ada di `public/icons/` dan `public/favicon.png` / `public/apple-touch-icon.png` di dalam project — lihat `CHANGELOG.md` untuk detail proses & verifikasinya. Motif "spiral yang naik" di atas tetap dipakai terpisah sebagai elemen progres di dalam UI (`components/LevelSpiral.tsx`) — dua aset visual berbeda yang saling melengkapi, bukan saling menggantikan: logo untuk identitas, spiral untuk progres harian.

**Empat pilar inti** (semua fitur A–K di spesifikasi awal dipetakan ke sini agar user tidak merasa "36 fitur acak"):
1. **Insting & Kecepatan Pikir** — seberapa cepat & tepat kamu memutuskan.
2. **Daya Ingat & Kecerdasan** — seberapa kuat kamu menyimpan dan menyambungkan informasi.
3. **Komunikasi & Percaya Diri** — seberapa jelas kamu menyampaikan diri ke dunia.
4. **Disiplin & Konsistensi** — seberapa jujur kamu menepati janji ke diri sendiri.

Lapisan di atas 4 pilar itu (Wawasan, Refleksi, Kesehatan, Ibadah/Keuangan, Prestise) adalah **hasil jangka panjang** dari 4 pilar tadi dijalankan konsisten — bukan modul terpisah yang berdiri sendiri. Ini penting supaya user paham *kenapa* semua fitur itu ada, bukan cuma daftar checklist.

---

## A2. Alur Pengguna: Hari Pertama sampai Konsisten Jangka Panjang

### Hari 0 — Onboarding (±10 menit, tidak lebih)
1. **3 layar intro** — filosofi STROPHE dijelaskan singkat (maks 2 kalimat per layar), bukan esai.
2. **Consent & Data Gate** — sebelum minta data sensitif (kesehatan, keuangan), app menjelaskan *kenapa* data itu dibutuhkan dan bahwa modul-modul itu **opt-in**, bisa dilewati. Modul Ibadah difinalkan untuk **Islam** (aplikasi ini untuk pemakaian pribadi, jadi tidak perlu tahap "pilih agama/tradisi" — langsung minta lokasi/kota domisili untuk kalkulasi jadwal sholat & arah kiblat).
3. **Diagnostik Awal (5–7 menit)** — tugas singkat di 4 pilar inti. **Ini bukan untuk melompati level** (aturan "mulai dari Level 1" tetap berlaku untuk semua orang), tapi untuk mengkalibrasi nada coach dan kecepatan eskalasi kesulitan.
4. **Kompas 5 Tahun** — isi visi 5 tahun (boleh kasar/belum matang, akan diperhalus nanti).
5. **Blueprint 1-5-10 Tahun (versi ringan)** — cukup 1 kalimat ide bisnis/arah karier; diperluas nanti di Reflection Level 10.
6. **Sesi Inti Level 1 langsung dimulai hari itu juga** — supaya user merasakan aksi nyata di hari pertama, bukan cuma isi formulir.

### Klarifikasi penting soal mekanisme "Level" (menutup celah ambiguitas di spesifikasi awal)
Supaya sistem tidak membingungkan saat dibangun, berikut logika pasti yang dipakai:
- **Level = penanda hari pemakaian yang konsisten**, bukan penanda "penguasaan sempurna." Selesai menjalani Sesi Inti hari ini (apa pun skornya) → besok otomatis lanjut ke level berikutnya. Kamu tidak mengulang level yang sama walau performanya jelek — performa memengaruhi **skor mental** dan **Growth Index** (lihat A6), bukan mengunci level.
- **Kalau user bolong sehari penuh** (tidak buka app sama sekali): level **berhenti** di angka terakhir (tidak maju, tidak mundur ke 1), dan skor mental turun sesuai jumlah hari bolong. Begitu user kembali, level lanjut dari titik terakhir + 1 di hari itu. Ini yang membuat "Streak Ganas" masuk akal: telat boleh, tapi ada konsekuensi yang terasa (skor turun), bukan hukuman total (reset ke nol).

### Minggu 1
- Hari 1–3: hanya **Sesi Inti** aktif, belum ada Skill Rotasi — supaya user tidak kewalahan di awal.
- Hari 4: **Skill Rotasi #1 — Daya Ingat** dibuka (dipilih pertama karena jadi fondasi skill lain).
- Hari 7: **Insting Speed Log** grafik pertama muncul (butuh minimal data seminggu). **Brutal Honesty Report v1** — versi ini nadanya membangun kepercayaan dulu, belum "brutal" penuh (baru mulai di minggu 2) supaya user tidak kabur di awal.

### Minggu 2–6 — Skill Rotasi dibuka bertahap (1 skill baru per minggu, bukan sekaligus)
- Minggu 2: **English Shadow Mode**
- Minggu 3: **Voice Confidence Check** + **Public Speaking Trainer**
- Minggu 4: **Latihan Kesehatan** (jika modul kesehatan diaktifkan user) + **Checklist Kebersihan Diri**
- Minggu 5: **Global Mentor Rotation** mulai berputar + **World Perspective Log**
- Minggu 6: **Ibadah** (jadwal sholat 5 waktu, arah kiblat, reminder — langsung aktif, sudah difinalkan untuk Islam) **& Keuangan** (jika modul diaktifkan) — Keuangan tetap diletakkan belakangan karena datanya paling sensitif dan kepercayaan user ke app perlu terbangun dulu; Ibadah bisa diaktifkan lebih awal kalau mau, tidak wajib menunggu minggu 6.

### Titik-titik tetap sepanjang perjalanan (berulang otomatis)
| Pemicu | Yang terjadi |
|---|---|
| Tiap 10 level | **Reflection Level** — bandingkan jawaban sekarang vs jawaban lama |
| Tiap 20 level | **Kompas 5 Tahun check** — apakah tindakan harian masih selaras visi |
| Tiap 50 level | **Diamond Checkpoint** — ujian gabungan semua skill |
| Tiap 25 level | **Babak (Chapter) baru** — dinamai otomatis oleh Cross-Skill Insight Engine berdasar area yang paling berkembang |
| 1x/minggu (maks) | **Reverse Level (Uji Nyali)** |
| Acak, jarang | **Zona Nyaman Breaker**, **Real-Life Mission** |
| Bulanan | **Blueprint 1-5-10 Tahun review**, **Kematangan Kepribadian check** |

### Fase jangka panjang (bulan 3+)
Semua fitur aktif penuh, loop harian stabil: Sesi Inti → Skill Rotasi hari itu → (kadang) Real-Life Mission/Zona Nyaman Breaker → notifikasi ringan (Silent Mode) kalau app tidak dibuka. Diamond Tier terus terakumulasi tanpa batas atas.

---

## A3. Contoh Isi Level 1–5 — Sesi Inti

Setiap level berisi 5 stasiun singkat (Disiplin, Insting, Ketelitian, Mental Tangguh, Percaya Diri), total 10–15 menit. Bahasa dibuat sesederhana mungkin, seolah user baru pertama kali dengar konsep ini.

### 🔹 LEVEL 1 — "Mulai dari Nol yang Jujur" (±12 menit)
1. **Disiplin (3 menit).** Checklist jujur, tidak diverifikasi siapa pun: *"Sudah rapikan tempat tidur pagi ini? Sudah gosok gigi?"* Tujuannya bukan mengecek fakta, tapi melatih kejujuran ke diri sendiri. Feedback AI: *"Disiplin bukan soal hal besar. Ini soal apakah kamu menepati janji kecil ke dirimu sendiri."*
2. **Insting (2 menit).** Skenario dengan hitung mundur 10 detik: *"Waktu makan siangmu 30 menit. Kantin favorit penuh. Ada warung baru di sebelahnya yang belum pernah kamu coba. Pilih cepat: (A) Tunggu di kantin favorit, (B) Coba warung baru."* Tidak ada jawaban "benar" — yang dinilai kecepatan & ketegasan memutuskan.
3. **Ketelitian (3 menit).** Paragraf pendek berisi 3 kejanggalan (misal jadwal yang salah tanggal, angka yang tidak konsisten). User cari kejanggalan dalam 60 detik.
4. **Mental Tangguh (2 menit).** *"Sebutkan 1 hal yang gagal kamu lakukan hari ini, sekecil apa pun. Lalu tulis 1 hal yang bisa kamu lakukan beda besok."*
5. **Percaya Diri (2 menit).** *"Tuliskan dengan lantang (boleh diucapkan keras-keras di kamar) satu kalimat yang dimulai: 'Hari ini saya berhasil...'"* — dicatat sebagai baseline, dibandingkan lagi nanti setelah Voice Confidence Check aktif di minggu 3.

### 🔹 LEVEL 2 — "Jendela Waktu Menyempit" (±12 menit)
1. **Disiplin.** Checklist sama, tapi ditambah jendela waktu: *"Selesaikan sesi ini sebelum jam 9 pagi."*
2. **Insting.** Timer turun jadi 8 detik, opsi jadi 3: tambahkan opsi (C) yang sengaja terdengar menggoda tapi kurang realistis, melatih user menimbang cepat, bukan asal pilih opsi tengah.
3. **Ketelitian.** Cari 4 kejanggalan dalam 50 detik, teksnya sedikit lebih panjang.
4. **Mental Tangguh.** Ditambah langkah *reframe*: dari kegagalan tadi, user harus menulis **1 langkah konkret** (bukan cuma niat) untuk besok.
5. **Percaya Diri.** Sama seperti Level 1, tapi user diminta membaca ulang kalimat Level 1 dulu sebelum menulis yang baru — mulai membangun kebiasaan bandingkan diri sendiri, bukan orang lain.

### 🔹 LEVEL 3 — "Distraksi Pertama" (±13 menit)
1. **Disiplin.** Ditambah godaan: notifikasi palsu-latihan muncul di tengah sesi ("Pesan baru!") — user dinilai apakah tergoda membuka atau menyelesaikan sesi dulu.
2. **Insting.** Skenario dengan konsekuensi berlapis: pilihan A/B masing-masing punya efek susulan yang harus dipikirkan dalam 8 detik.
3. **Ketelitian.** 4 kejanggalan, tapi teks kali ini berupa "instruksi kerja" pendek — melatih ketelitian dalam konteks yang lebih realistis (mirip cek dokumen kerja).
4. **Mental Tangguh.** Diperkenalkan istilah **"reappraisal"** (dijelaskan otomatis: *"Reappraisal itu seperti melihat ulang foto burem — bukan menghapusnya, tapi mencari sudut yang lebih jelas."*) — user melihat ulang kegagalan Level 1 dengan cara pandang baru.
5. **Percaya Diri.** Direkam suara (jika Voice Confidence sudah aktif) atau tetap teks — tambah 1 kalimat alasan *kenapa* pencapaian itu berarti.

### 🔹 LEVEL 4 — "Tekanan Waktu Nyata" (±13 menit)
1. **Disiplin.** Target waktu makin ketat + ditambah 1 kebiasaan baru untuk dicek (misal minum air putih pagi ini).
2. **Insting.** Dua skenario berurutan, masing-masing 7 detik — melatih pemulihan fokus cepat setelah keputusan pertama.
3. **Ketelitian.** 5 kejanggalan dalam 45 detik, sebagian kejanggalan lebih halus (angka yang salah tapi masuk akal).
4. **Mental Tangguh.** User diminta menuliskan kegagalan **orang lain** yang pernah dia lihat dan pelajaran dari situ — melatih ketangguhan lewat perspektif, bukan cuma diri sendiri.
5. **Percaya Diri.** Latihan nada suara: ucapkan kalimat afirmasi 2x — sekali pelan, sekali tegas — app catat mana yang terasa lebih meyakinkan (self-rating, bukan analisis AI yang mengklaim akurat).

### 🔹 LEVEL 5 — "Putaran Pertama Selesai" (±15 menit, sedikit lebih panjang, sengaja jadi mini-milestone)
1. **Disiplin.** Checklist mingguan pertama: rekap 5 hari terakhir, tandai jujur mana yang bolong.
2. **Insting.** Skenario gabungan: keputusan yang menyentuh lebih dari satu pilar (misal keputusan yang butuh insting DAN pertimbangan disiplin).
3. **Ketelitian.** Tugas "audit" pendek — user cek ulang salah satu jawaban sendiri dari Level 1–4 (disimpan otomatis), cari apakah ada ketidakkonsistenan dalam cara dia menjawab.
4. **Mental Tangguh.** Sesi refleksi mini: *"Dari 5 hari ini, kapan kamu paling dekat menyerah? Apa yang membuatmu tetap lanjut?"*
5. **Percaya Diri.** Bandingkan rekaman/tulisan Level 1 vs Level 5 berdampingan di layar — bukan AI yang menilai "kamu sudah lebih baik," tapi user sendiri yang menilai apakah terasa beda.

---

## A4. Contoh Isi Level 1–5 — Skill Rotasi: Daya Ingat

**Level 1 — Mengenal Kapasitas Sendiri.** Tampilkan 5 kata benda sehari-hari (misal: payung, sendok, jam, sepatu, kunci) selama 20 detik. Jeda 2 menit diisi tugas ringan tak berhubungan (hitung mundur dari 50 kelipatan 3). Lalu user diminta menulis ulang 5 kata tadi, urutan bebas.

**Level 2 — Urutan Itu Penting.** 7 kata, dan kali ini urutan harus persis benar, bukan cuma isinya. Penjelasan otomatis kenapa urutan lebih sulit: *"Otak kita lebih gampang ingat 'apa saja isinya' daripada 'urutan persisnya' — seperti ingat kamu beli apa di minimarket, tapi lupa urutan kamu ambilnya."*

**Level 3 — Campur Angka dan Kata.** Kombinasi: 4 kata + nomor telepon fiktif 6 digit. Melatih otak menyimpan dua jenis informasi sekaligus.

**Level 4 — Teknik Istana Ingatan (diperkenalkan, bukan diasumsikan sudah tahu).** Penjelasan sederhana: *"Bayangkan rumahmu sendiri. Taruh tiap item yang mau diingat di satu ruangan berbeda — payung di depan pintu, sendok di kasur, jam di kamar mandi. Nanti tinggal 'jalan-jalan' di rumah itu dalam pikiran untuk mengingat semuanya."* Latihan: 6 item ditempatkan di 6 "ruangan" imajiner, recall setelah 3 menit distraksi.

**Level 5 — Recall dari Konteks.** Baca paragraf pendek (±80 kata, cerita sederhana). Setelah distraksi 3 menit, jawab 5 pertanyaan detail dari paragraf itu (bukan hafalan kata per kata, tapi pemahaman + ingatan detail).

**Cara Memory Vault bekerja setelahnya:** Mulai Level 6 dan seterusnya, item dari Level 1 (misal kata "payung") **muncul lagi tanpa pemberitahuan**, disisipkan di antara materi baru — ini yang membuat spaced repetition efektif: otak dipaksa mengingat sesuatu yang sudah "dianggap selesai," bukan cuma materi baru.

---

## A5. Sistem Reward & Progress Agar Tidak Bosan (Level Tanpa Batas)

- **Animasi penyelesaian level** minimalis: satu garis emas "berputar" menutup lingkaran spiral — bukan confetti. Disertai 1 baris insight personal (bukan pujian generik), misal: *"Waktu reaksimu di Insting turun 1.2 detik minggu ini."*
- **Babak (Chapter)** setiap 25 level, dinamai otomatis oleh Cross-Skill Insight Engine berdasar area yang paling berkembang di periode itu (contoh: *"Babak III: Ketegasan dalam Ambiguitas"*) — memberi rasa "cerita" pada progres tanpa batas, bukan sekadar angka naik terus.
- **Diamond Tier System** (sesuai spesifikasi awal, dirapikan):
  - Diamond Checkpoint tiap 50 level — ujian gabungan semua skill yang pernah dipelajari.
  - Diamond Badge permanen — tidak hilang walau performa turun setelahnya.
  - Diamond Mentor — gaya AI lebih tegas & menantang setelah dibuka.
  - Diamond Multiplier — progres di atas Diamond dihitung 3–5x lebih berat ke Growth Index (bukan ke nomor level, supaya level tetap linear dan mudah dipahami).
  - Diamond Vault — galeri visual rekap perubahan dari Level 1 sampai Diamond terakhir (rekaman suara, jawaban refleksi, grafik Insting berdampingan).
  - Diamond Reset Protection — status Diamond tidak turun walau absen beberapa hari.
- **Momentum Score (0–100), mingguan** — gabungan streak, skor mental, dan Growth Index dalam satu angka, supaya user tidak cuma lihat "level naik" tapi juga "apakah aku benar-benar maju."
- **Perbandingan sosial bersifat opt-in dan default mati** — kalau user mengaktifkan, hanya persentil anonim ("kamu lebih konsisten dari 62% pengguna lain minggu ini"), tidak ada leaderboard nama untuk menghindari tekanan sosial yang tidak sehat.
- **Titel/lencana berbasis bukti nyata**, bukan sekadar angka level — misal lencana *"90 Hari Tanpa Alasan"* hanya keluar kalau data streak+skor mental benar-benar mendukung klaim itu.

---

## A6. Cara Mengukur bahwa User Benar-Benar Berubah (Bukan Sekadar Selesai Level)

Karena Level di STROPHE pada dasarnya adalah **penanda kehadiran/konsistensi** (lihat klarifikasi di A2), dibutuhkan metrik terpisah untuk mengukur perubahan nyata:

**Growth Index** — skor gabungan dari:
1. Tren kecepatan + ketepatan di Insting Speed Log (bukan cuma kecepatan — kecepatan tanpa ketepatan bukan kemajuan).
2. Akurasi & tren di Ketelitian dari waktu ke waktu.
3. Kurva recall di Memory Vault (apakah materi lama makin gampang diingat).
4. Kualitas isi Decision Journal — bukan jumlah entri, tapi apakah polanya bergeser dari reaktif ke deliberatif (dianalisis AI, ditunjukkan sebagai pola, bukan skor angka palsu).
5. Apakah tema di Brutal Honesty Report **mengecil** dari minggu ke minggu (kelemahan yang sama terus muncul = belum berubah; kelemahan makin variatif/mengecil = ada progres).
6. Alignment Score Kompas 5 Tahun — persentase tindakan harian yang user sendiri tandai selaras dengan visi 5 tahunnya.

**Dashboard wajib menampilkan Level dan Growth Index berdampingan**, dan secara eksplisit memberi tahu user kalau ada kesenjangan:
> "Level kamu naik terus, tapi Growth Index stagnan 3 minggu terakhir. Ini biasanya artinya kamu rajin buka app, tapi jawaban refleksimu belum banyak berubah. Coba lebih jujur di sesi berikutnya."

**Sinyal eksternal (opsional, bulanan, self-report, tidak dikarang):** pertanyaan sederhana *"Ada orang di sekitarmu yang belakangan ini komentar kamu berubah?"* — dicatat sebagai catatan kualitatif, bukan diklaim sebagai bukti ilmiah.

---

## A7. Data Real yang Wajib Diminta di Awal (untuk fitur berlabel ⚠️)

| Modul | Data yang wajib ditanya sebelum kasih saran | Catatan |
|---|---|---|
| **Asupan Protein & Bentuk Tubuh** | Berat badan, tinggi badan, usia, jenis kelamin, tingkat aktivitas harian, tujuan tubuh (kurus/ideal/otot), riwayat alergi/kondisi medis relevan (opsional) | Rujukan resmi: AKG Kemenkes RI. Jika data resmi terbaru tidak bisa diverifikasi saat itu, app wajib bilang terus terang dan minta user cek sumber valid. |
| **Perawatan Wajah** | Jenis kulit (kering/oily/sensitif/kombinasi), masalah kulit spesifik, riwayat alergi produk, iklim/lokasi domisili | Tidak boleh klaim bahan aktif tanpa dasar; arahkan user cek label BPOM sendiri. |
| **Kebersihan Diri** | Tidak butuh data sensitif — cukup checklist harian standar | Boleh langsung jalan tanpa gate data. |
| **Ibadah (Islam)** | Kota/lokasi domisili (untuk jadwal sholat 5 waktu & arah kiblat), metode perhitungan jadwal kalau user punya preferensi khusus (default: Kemenag RI), preferensi reminder tambahan — dzikir pagi/petang, puasa sunnah Senin-Kamis, dll (opsional, boleh diaktifkan belakangan) | Ini untuk pemakaian pribadi, jadi tidak ada tahap pilih-agama di onboarding — langsung Islam. Rujukan resmi: jadwal Kemenag/Bimas Islam. Kalau app tidak bisa akses sumber jadwal real-time saat itu, wajib jujur soal keterbatasan itu dan arahkan user cek sumber resmi (situs Bimas Islam Kemenag atau app jadwal sholat terverifikasi) sebagai cadangan. |
| **Atur Keuangan** | Rentang penghasilan bulanan (bukan nominal presisi demi privasi), pengeluaran tetap, ada/tidaknya utang, tujuan finansial jangka pendek & panjang, profil risiko | Untuk data pasar (saham, reksa dana, kripto), user wajib menyediakan data real-time sendiri — app dilarang mengarang harga atau performa. |
| **Umum (semua user)** | Bahasa asal (untuk kalibrasi Auto-Simplifier & titik mulai English Shadow Mode), zona waktu | Dipakai lintas modul. |

**Prinsip privasi:** modul Keuangan tetap yang paling sensitif — harus punya toggle jelas "Aktifkan/Lewati" di onboarding, dan user bisa menonaktifkan kapan saja di pengaturan tanpa kehilangan progres modul lain. Modul Ibadah (Islam) boleh langsung aktif dari awal karena sudah final untuk pemakaian pribadi, tapi tetap sediakan toggle notifikasi (misal matikan reminder saat travel/perjalanan) di pengaturan.

---

# BAGIAN B — MODUL AKADEMI ANALISIS SAHAM

## B1. Alur Belajar Level 1–5 — Kategori Analisis Fundamental

### Level 1 — Membaca Laporan Keuangan Dasar
**Yang dipelajari:** neraca, laba rugi, arus kas — lewat analogi.
- Neraca = *"foto sekali jepret dari kekayaan perusahaan hari itu — apa yang dipunya (aset) dikurangi apa yang dihutang (liabilitas) = kekayaan bersih (ekuitas)."*
- Laba rugi = *"rapor untung-rugi selama periode tertentu, bukan sekali jepret."*
- Arus kas = *"aliran uang yang benar-benar masuk-keluar dompet perusahaan — beda dengan 'untung di atas kertas.'"*

Contoh dialog Coach:
> **Coach:** "Bayangkan kamu punya warung. Neraca itu kayak kamu berdiri hari ini dan menghitung: berapa uang di kasir + stok barang (aset), dikurangi utang ke supplier (liabilitas). Sisanya, itu 'milikmu' bersih (ekuitas). Paham sampai sini?"

### Level 2 — Rasio Profitabilitas Dasar
**Yang dipelajari:** PER dan EPS.
- EPS = *"berapa untung yang 'jatah' ke tiap satu lembar saham."*
- PER = *"berapa lama modal kamu balik kalau untung perusahaan segini terus setiap tahun — makin kecil angkanya, makin cepat (secara teori) modal balik."*

*Latihan (angka ilustrasi, bukan data emiten nyata):* Jika harga saham Rp1.000 dan EPS Rp100, berapa PER-nya? (Jawaban: 10x — artinya "butuh 10 tahun balik modal kalau untung segini terus," dengan catatan bahwa asumsi "untung segini terus" jarang realistis di dunia nyata.)

### Level 3 — Rasio Valuasi & Solvabilitas
**Yang dipelajari:** PBV, DER, ROE, ROA, Dividend Yield.
- PBV = *"harga saham dibanding nilai buku per lembar — semacam bertanya 'apakah aku bayar lebih mahal dari yang tercatat di buku perusahaan.'"*
- DER = *"perbandingan utang vs modal sendiri — seperti membandingkan berapa besar rumahmu dibiayai KPR vs uang sendiri."*
- ROE/ROA = *"seberapa efisien modal/aset perusahaan menghasilkan untung."*
- Dividend Yield = *"berapa persen 'uang saku' yang dibagikan dibanding harga saham — tapi angka tinggi sendirian belum tentu bagus (lihat studi kasus di B2)."*

### Level 4 — Analisis Kualitatif
**Yang dipelajari:** moat/keunggulan bersaing, kualitas manajemen (GCG), posisi di industri, sensitivitas terhadap regulasi. Ini level pertama yang **tidak bisa dijawab pakai rumus** — Coach melatih user berpikir kualitatif: *"Kalau kompetitor baru masuk besok dengan modal besar, apa yang membuat perusahaan ini tetap sulit dikalahkan?"*

### Level 5 — Analisis Komparatif & Expert
**Yang dipelajari:** membandingkan valuasi antar emiten **sejenis** (PER sektor, bukan cuma satu saham berdiri sendiri), serta riwayat & konsistensi dividen dari waktu ke waktu (bukan cuma yield sesaat). Coach menekankan: *"PER 10x itu murah atau mahal? Tidak bisa dijawab sendirian — harus dibandingkan dengan PER rata-rata perusahaan sejenis di sektor yang sama."*

---

## B2. Studi Kasus Ilustrasi Lengkap

> ⚠️ **Label wajib ditampilkan di awal dan di setiap layar studi kasus ini:** *"Ini contoh ilustrasi dengan angka rekaan untuk latihan cara berpikir. PT Ilustrasi Makmur Tbk (kode ILUS) adalah perusahaan FIKTIF — bukan data emiten nyata mana pun."*

**Data ilustrasi yang diberikan ke user:**
- Harga saham: Rp2.000/lembar
- EPS setahun terakhir: Rp150
- Nilai buku per lembar: Rp1.800
- Total utang: Rp400 miliar, Total ekuitas: Rp250 miliar
- Dividen dibagikan tahun ini: Rp180/lembar (naik drastis dari Rp40/lembar tahun lalu)
- Laba bersih tahun ini turun 15% dibanding tahun lalu

**Alur bimbingan Coach (contoh dialog):**

> **Coach:** "Coba hitung dulu PER-nya. Rumusnya harga saham dibagi EPS."
> **User:** "2000 dibagi 150... sekitar 13,3x"
> **Coach:** "Benar. Sekarang hitung Dividend Yield-nya — dividen dibagi harga saham."
> **User:** "180 dibagi 2000... 9%!"
> **Coach:** "9% itu tinggi sekali untuk ukuran umum. Pertanyaan saya: apakah kamu langsung mau beli karena yield setinggi itu?"
> **User:** "Iya, kedengarannya menguntungkan."
> **Coach:** "Ini kesalahan pemula yang paling sering terjadi — mengejar yield tinggi tanpa cek **keberlanjutannya**. Lihat lagi data: laba bersih tahun ini justru **turun 15%**, tapi dividen malah naik drastis dari Rp40 ke Rp180. Menurutmu, dari mana perusahaan membayar dividen sebesar itu kalau labanya turun?"
> **User:** "...dari kas cadangan?"
> **Coach:** "Bisa jadi, dan itu bukan otomatis buruk sekali — tapi itu tandanya kamu harus curiga: apakah dividen setinggi ini bisa bertahan tahun depan, atau ini cuma sekali karena perusahaan 'mengosongkan tabungan'? Ini kenapa di Level 5 kamu belajar soal **riwayat & konsistensi dividen**, bukan cuma yield satu tahun. Yield tinggi sesaat, dengan laba yang turun, adalah sinyal untuk digali lebih dalam — bukan alasan otomatis untuk beli."

**Kesalahan umum yang ditunjukkan di studi kasus ini:** mengejar dividend yield tinggi tanpa mengecek keberlanjutannya terhadap tren laba — persis kesalahan pemula yang disebut di fitur "Uji Kesalahan Umum."

**Penutup wajib di akhir studi kasus:**
> "Ini pembelajaran cara berpikir analisis, bukan rekomendasi beli/jual saham apa pun. Semua angka di atas rekaan. Keputusan investasi nyata sepenuhnya tanggung jawab kamu, berdasarkan data nyata yang kamu verifikasi sendiri."

---

## B3. Data Real yang Harus Diminta Sebelum Modul Ini Dipakai Penuh

| Kebutuhan | Data yang wajib diminta dari user | Sumber yang disarankan ke user |
|---|---|---|
| Harga saham & pergerakan | Screenshot/angka harga real-time emiten yang mau dianalisis | IDX, RTI Business, Stockbit, aplikasi sekuritas |
| Laporan keuangan emiten | Laporan keuangan (neraca, laba rugi, arus kas) emiten spesifik | Situs resmi IDX / situs Investor Relations emiten |
| Data kepemilikan saham | Data KSEI untuk analisis foreign flow / kepemilikan | KSEI, laporan sekuritas |
| Suku bunga acuan | BI Rate & Fed Funds Rate terkini | Situs resmi Bank Indonesia / Federal Reserve |
| Inflasi & kurs | Data inflasi & nilai tukar Rupiah terbaru | BPS, Bank Indonesia |
| Kebijakan sektoral | Kebijakan pemerintah terbaru yang relevan dengan sektor emiten | Situs kementerian terkait, berita resmi |
| Corporate action & berita | Berita kontrak baru, ekspansi, litigasi, right issue, dll | Keterbukaan Informasi IDX, situs resmi emiten |
| Aturan pajak | Persentase pajak capital gain & dividen **terbaru** | Rujukan resmi DJP — dilarang pakai angka dari ingatan lama tanpa verifikasi |
| Status legal emiten | Status UMA/suspend/riwayat sanksi | Pengumuman resmi BEI/OJK |
| Profil pribadi untuk manajemen risiko | Modal awal yang mau dipakai, toleransi risiko, horizon waktu (trading vs investasi jangka panjang) | Diisi langsung oleh user, bukan dicari otomatis |

**Disclaimer wajib ditampilkan di layar pembuka modul, setiap kali modul dibuka pertama kali dalam sesi:**
> "Ini pembelajaran analisis, bukan rekomendasi beli/jual saham. Keputusan investasi tetap sepenuhnya tanggung jawab pengguna."

---

*Dokumen ini dirancang agar bisa langsung dipakai sebagai spesifikasi kerja — setiap bagian berisi konten konkret (bukan placeholder), logika Level yang sebelumnya ambigu di brief awal sudah diperjelas (lihat A2), dan modul Ibadah sudah difinalkan untuk Islam sesuai kebutuhan pemakaian pribadi (bukan konfigurasi lintas-keyakinan) supaya implementasinya lebih sederhana dan fokus.*
