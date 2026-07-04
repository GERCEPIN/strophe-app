# CLAUDE.md — Peta Status & Panduan Melanjutkan STROPHE

Dokumen ini untuk Claude Code (atau siapa pun) yang melanjutkan proyek ini.
Isinya: status implementasi ke-36 fitur secara jujur, dan pola kode yang
harus diikuti supaya konsisten dengan fondasi yang sudah ada.

**Prinsip utama proyek ini yang WAJIB dipertahankan saat menambah fitur:**
1. Business logic inti (leveling, streak, spaced repetition, dsb) adalah
   **pure function** di `src/lib/engine/`, tanpa DB/network, dan **selalu**
   punya test di `src/lib/engine/__tests__/`.
2. Setiap system prompt AI **wajib** dibungkus `withCoreRules()` dari
   `src/lib/ai/prompts/base.ts` — ini yang menegakkan aturan #3/#4/#5 dari
   spec asli (bahasa sederhana, anti-halusinasi, klaim jujur).
3. Fitur yang butuh data real dari user (kesehatan, keuangan, ibadah, harga
   saham) **tidak boleh** punya endpoint yang memberi saran sebelum data itu
   ada di database. Cek dulu, kalau kosong, minta diisi — jangan biarkan AI
   improvisasi.

---

## Status per fitur

### A. Insting & Kecepatan Berpikir
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 1 | AI Insting Trainer | Selesai | `api/insting/scenario`, `api/insting/submit`, `components/InstingTrainer.tsx` |
| 2 | Insting Speed Log (grafik mingguan) | Sebagian — API selesai, belum ada chart UI | `api/insting/speed-log/route.ts` — perlu komponen chart (bisa pakai `recharts`) yang fetch endpoint ini dan render sebagai line chart |
| 3 | Reverse Level (Uji Nyali) | Selesai, termasuk limit 1x/minggu | `api/insting/scenario/route.ts` fungsi `reverseLevelUsedThisWeek` |

### B. Daya Ingat & Kecerdasan
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 4 | Memory Vault (spaced repetition) | Selesai | `lib/engine/spacedRepetition.ts`, `api/memory-vault/*`, `app/skill/daya-ingat` |
| 5 | Latihan daya ingat & logika bertahap | Sebagian — 5 teknik memori nyata sudah ada (`content/memoryVaultLevels.ts`), puzzle logika terpisah belum |
| 6 | Cross-Skill Insight Engine | Belum ada — perlu tabel baru + AI yang membaca progres lintas track dan cari korelasi. Mulai dari query `getAllTrackProgress` yang sudah ada di `levelProgressService.ts` |

### C. Komunikasi & Percaya Diri
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 7 | Voice Confidence Check | Schema saja (`voiceConfidenceChecks`) | Butuh keputusan produk: rekam via browser (MediaRecorder API) lalu kirim transcript ke model lewat OpenRouter, atau pakai Web Speech API browser untuk transcribe di client. Diskusikan dulu sebelum membangun — ada trade-off privasi (audio user) yang perlu keputusan sadar. |
| 8 | Public Speaking Trainer | Schema saja (`publicSpeakingSessions`) | Sama seperti #7 — butuh transcript dulu |
| 9 | Latihan bahasa tubuh | Belum ada schema/API | Kemungkinan cukup berupa checklist instruksi statis (seperti Sesi Inti), tidak perlu AI |
| 10 | English Shadow Mode | Schema saja (`englishShadowSessions`) | Sama seperti #7/#8 |

### D. Disiplin & Konsistensi
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 11 | Streak Ganas | Selesai, diuji lengkap | `lib/engine/streak.ts`, `lib/services/mentalScoreService.ts` |
| 12 | Panic Button Anti-Menyerah | Selesai | `lib/engine/streak.ts` fungsi `shouldShowPanicButton`, ditampilkan di `app/dashboard/page.tsx` |
| 13 | Silent Mode Progress (notifikasi) | Belum ada | Butuh Web Push API + service worker (di luar scope Next.js biasa) — kalau di-deploy sebagai PWA, ini bisa ditambah belakangan |

### E. Wawasan & Skill Baru
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 14 | Skill Radar | Schema saja (`skillRadarSuggestions`) | Butuh AI prompt baru di `lib/ai/prompts/` yang membaca `getAllTrackProgress` + jawaban user, lalu rekomendasi skill. Pola sama seperti `journal/route.ts` (AI call sinkron setelah aksi user). |
| 15 | Skill Combo Unlock | Schema saja (`skillComboUnlocks`) | Perlu aturan eksplisit "kombinasi level X di track A + level Y di track B = unlock boss level track C" — sebaiknya pure function di `lib/engine/` dulu (mudah ditest) sebelum di-wire ke DB |
| 16 | Real-Life Mission | Schema saja (`realLifeMissions`) | CRUD sederhana: AI generate misi (mirip pola `insting/scenario`), user lapor hasil |
| 17 | Zona Nyaman Breaker | Field `category` sudah ada di `realLifeMissions` | Bagian dari #16 — set `category: "zona_nyaman_breaker"` saat generate |

### F. Perspektif & Wawasan Luas
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 18 | Global Mentor Rotation | Prompt personas selesai (`lib/ai/prompts/globalMentor.ts`), belum dipasang ke fitur chat mana pun | Paling gampang: tambahkan pilihan mentor ke Investor Coach ATAU jadi mentor umum baru dengan chat sendiri, pola sama seperti `investor/chat/route.ts` |
| 19 | Bahasa & Peribahasa Dunia | Belum ada | Bisa jadi konten statis (seperti `content/`) — kumpulan peribahasa yang dihubungkan ke level tertentu, TIDAK perlu AI (menghindari risiko halusinasi soal atribusi budaya) |
| 20 | Skenario Lintas Budaya | Belum ada | Mirip Insting Scenario tapi dengan konteks budaya berbeda — bisa reuse pola `instingScenario.ts` |
| 21 | World Perspective Log | Schema saja (`worldPerspectiveLogs`) | CRUD sederhana, mirip `journal/route.ts` tapi tanpa perlu AI (cukup catatan user) |

### G. Refleksi & Jangka Panjang
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 22 | Decision Journal Otomatis | Selesai | `api/journal/route.ts`, `app/journal` |
| 23 | Kompas 5 Tahun | Simpan/lihat selesai, "cek keselarasan tiap 20 level" belum ada trigger otomatis | Tambahkan pengecekan `isMultipleOfLevel(level, 20)` di `core-session/route.ts` (pola sama seperti `isReflectionLevel`), lalu panggil AI untuk bandingkan progres vs `visi5Tahun` |
| 24 | Reflection Level | Deteksi level kelipatan 10 sudah ada (`isReflectionLevel` di response `core-session`), tapi belum ada halaman untuk isi refleksinya | Tambah `app/reflection/page.tsx` + `api/reflection/route.ts` pakai tabel `reflectionLogs` yang sudah ada |
| 25 | Future Self Simulator | Prompt selesai (`lib/ai/prompts/futureSelfSimulator.ts`), API/UI belum | Buat `api/future-self/route.ts` yang kumpulkan progress summary (pakai `getAllTrackProgress` + `getCurrentMentalScore`), panggil prompt, simpan ke `futureSelfSimulations` |
| 26 | Brutal Honesty Report | Prompt selesai (`lib/ai/prompts/brutalHonesty.ts`), API/UI belum | Perlu agregasi data mingguan dulu (completion rate, mental score trend) — JANGAN biarkan AI mengarang angka, hitung dulu di kode baru masukkan ke prompt sebagai `weeklyDataSummary` |
| 27 | Blueprint 1-5-10 Tahun | Selesai (bagian dari Kompas) | `app/kompas/page.tsx`, field `blueprintBisnis` |
| 28 | Kematangan Kepribadian | Belum ada | Mirip Reflection Level tapi bulanan dan fokus ke pola keputusan — bisa query `decisionJournalEntries` dari 30 hari terakhir dan minta AI bandingkan dengan 30 hari sebelumnya |

### H. Kesehatan & Perawatan Diri (data real wajib dulu)
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 29 | Asupan Protein & Bentuk Tubuh | Pengumpulan data selesai (`healthProfiles`), endpoint saran belum | PENTING: sebelum bikin endpoint saran, cek `healthProfiles` user ada isinya. Kalau kosong, balas suruh isi onboarding dulu, JANGAN panggil AI dengan data kosong. Rujuk AKG Kemenkes — karena AI tidak boleh mengarang angka gizi, pertimbangkan menyimpan tabel referensi AKG resmi secara manual di kode (bukan diminta ke AI) |
| 30 | Perawatan Wajah | Sama seperti #29, pakai `skinType`/`skinConcerns` | Sama prinsipnya — AI cuma boleh kasih arahan umum + selalu sarankan cek BPOM, tidak boleh klaim bahan aktif spesifik tanpa dasar |
| 31 | Kebersihan Diri (checklist) | Belum ada | Ini TIDAK butuh AI sama sekali — cukup checklist statis harian + tabel log sederhana |

### I. Ibadah & Keuangan (data real wajib dulu)
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 32 | Pengingat Ibadah | Pengumpulan lokasi selesai (`prayerProfiles`), integrasi API resmi belum | Rekomendasi: pakai Aladhan API (aladhan.com/prayer-times-api, gratis, tanpa key) dari server route `api/prayer-times/route.ts`. WAJIB: kalau fetch gagal, balas jujur "tidak bisa ambil jadwal sekarang", JANGAN fallback ke jadwal karangan. |
| 33 | Atur Keuangan | Pengumpulan data selesai (`financeProfiles`), endpoint saran belum | Sama prinsip #29 — cek data ada dulu. Untuk data pasar (saham/reksadana/kripto), API HARUS minta user paste data real-time sendiri, jangan pernah AI generate angka pasar. |

### J. Sistem Prestise
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 34 | Diamond Tier System | Mekanisme inti selesai & teruji (`lib/engine/diamondTier.ts`) | Sub-fitur yang belum: Diamond Vault (galeri visual rekap level 1->50->100...) dan Diamond Mentor Unlock (gaya AI mentor lebih tegas setelah lewat checkpoint — bisa reuse `globalMentor.ts` dengan persona baru "diamond_tegas") |

### K. Kamus Pribadi
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 35 | Auto-Simplifier / Kamus Pribadi | Selesai | `api/dictionary/simplify`, `app/kamus` |

### Modul Terpisah — Akademi Analisis Saham
| Bagian | Status | Lokasi |
|---|---|---|
| Kategori Fundamental, Level 1-5 + 1 studi kasus | Selesai | `content/stockFundamentalLevels.ts`, `app/akademi-saham` |
| Kategori Teknikal / Makro-Sektoral / Sentimen-Berita / Manajemen Risiko / Legal-Compliance | Infrastruktur siap (`stockCategoryEnum`, semua service/API sudah generic per-kategori), konten belum ditulis | Tambahkan array baru mirip `STOCK_FUNDAMENTAL_LEVELS` di `content/`, lalu tambahkan ke `seed.ts`. API `api/stock-academy/lesson?category=teknikal` dst SUDAH jalan begitu kontennya ada. |
| Investor Coach chat, anti-halusinasi, disclaimer | Selesai | `lib/ai/prompts/investorCoach.ts`, `api/investor/chat` |

**Legenda status:** Selesai · Sebagian (fondasi ada, perlu dilanjutkan) · Belum ada

---

## Pola kode untuk menambah fitur baru

Ikuti urutan ini supaya konsisten:

1. **Kalau ada logic murni** (perhitungan, aturan, scoring) -> tulis dulu di
   `src/lib/engine/nama.ts` sebagai pure function, TANPA import DB/network.
   Tulis test-nya di `src/lib/engine/__tests__/nama.test.ts` SEBELUM
   di-wire ke API. Jalankan `npm test` sampai hijau.
2. **Kalau butuh tabel baru** -> tambahkan di `src/db/schema.ts`, lalu
   `npm run db:generate` untuk membuat file migrasi baru di `drizzle/`.
   JANGAN edit migrasi lama yang sudah pernah di-`db:migrate` ke database
   nyata.
3. **Kalau butuh AI** -> buat prompt builder baru di
   `src/lib/ai/prompts/namaFitur.ts`, WAJIB bungkus dengan `withCoreRules()`.
   Kalau perlu output terstruktur (JSON), tulis juga Zod schema validasi
   di `src/lib/validation/` dan parse dengan try/catch (contoh:
   `validation/instingScenario.ts`).
4. **API route** -> `src/app/api/.../route.ts`, WAJIB mulai dengan
   `const { session, unauthorized } = await requireUser(); if (unauthorized) return unauthorized;`
   kecuali memang endpoint publik.
5. **Halaman/komponen** -> pakai `<AppShell>` untuk halaman yang perlu nav,
   pakai komponen dari `components/ui/` (Button, Card, Input, dst) supaya
   konsisten dengan tema dark/gold. Tambahkan link baru ke `NAV_ITEMS` di
   `components/AppShell.tsx` kalau ini halaman utama baru.
6. Jalankan `npm run typecheck && npm run lint && npm test && npm run build`
   sebelum menganggap fitur selesai — proyek ini sudah bersih dari error di
   keempatnya, jaga supaya tetap begitu.

## Menambah konten Level 6 ke atas

Konten Sesi Inti dan Memory Vault sengaja di-recycle (bukan 404) kalau
level user melebihi konten yang di-seed — lihat fungsi
`fetchContentForLevel` di `api/core-session/route.ts` dan
`fetchLessonForLevel` di `api/stock-academy/lesson/route.ts`. Untuk
menambah level baru:

1. Tambah entri baru ke `content/coreSessionLevels.ts` (atau
   `memoryVaultLevels.ts` / `stockFundamentalLevels.ts`) mengikuti bentuk
   yang sama persis.
2. Jalankan `npm run db:seed` lagi — script-nya idempotent (skip yang
   sudah ada), aman dijalankan berkali-kali.
