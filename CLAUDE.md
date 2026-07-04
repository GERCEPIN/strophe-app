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
| 2 | Insting Speed Log (grafik mingguan) | Selesai | `api/insting/speed-log/route.ts`, `components/InstingSpeedChart.tsx` (recharts dual-axis: waktu keputusan + akurasi) |
| 3 | Reverse Level (Uji Nyali) | Selesai, termasuk limit 1x/minggu | `api/insting/scenario/route.ts` fungsi `reverseLevelUsedThisWeek` |

### B. Daya Ingat & Kecerdasan
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 4 | Memory Vault (spaced repetition) | Selesai | `lib/engine/spacedRepetition.ts`, `api/memory-vault/*`, `app/skill/daya-ingat` |
| 5 | Latihan daya ingat & logika bertahap | Selesai | Memory Vault: `content/memoryVaultLevels.ts` (5 teknik memori). Puzzle Logika: `content/logicPuzzles.ts` (15 puzzle, 5 level), `app/puzzle-logika` — halaman statis interaktif, tanpa DB/AI |
| 6 | Cross-Skill Insight Engine | Selesai | `lib/ai/prompts/crossSkillInsight.ts`, `api/cross-skill/route.ts`, `app/cross-skill` — live AI (tidak dipersist), fetch ulang setiap klik |

### C. Komunikasi & Percaya Diri
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 7 | Voice Confidence Check | Schema saja (`voiceConfidenceChecks`) — **skip sampai ada keputusan produk** | Butuh keputusan: MediaRecorder API + OpenRouter, atau Web Speech API browser. Ada trade-off privasi audio yang perlu keputusan sadar. |
| 8 | Public Speaking Trainer | Schema saja (`publicSpeakingSessions`) — **skip sampai ada keputusan produk** | Sama seperti #7 — butuh transcript dulu |
| 9 | Latihan bahasa tubuh | Selesai (halaman statis) | `app/bahasa-tubuh/page.tsx` — 5 area checklist statis (kontak mata, postur, tangan, ekspresi, jarak), tidak butuh AI/DB |
| 10 | English Shadow Mode | Schema saja (`englishShadowSessions`) — **skip sampai ada keputusan produk** | Sama seperti #7/#8 |

### D. Disiplin & Konsistensi
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 11 | Streak Ganas | Selesai, diuji lengkap | `lib/engine/streak.ts`, `lib/services/mentalScoreService.ts` |
| 12 | Panic Button Anti-Menyerah | Selesai | `lib/engine/streak.ts` fungsi `shouldShowPanicButton`, ditampilkan di `app/dashboard/page.tsx` |
| 13 | Silent Mode Progress (notifikasi) | Belum ada — **butuh keputusan arsitektur** | Butuh Web Push API + service worker (di luar scope Next.js biasa). Bisa ditambah kalau app di-deploy sebagai PWA. |

### E. Wawasan & Skill Baru
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 14 | Skill Radar | Selesai | `lib/ai/prompts/skillRadar.ts`, `api/skill-radar/route.ts`, `app/skill-radar` — AI rekomendasikan track mana yang perlu difokuskan |
| 15 | Skill Combo Unlock | Selesai | `lib/engine/skillCombo.ts` (5 COMBO_RULES, pure function, 7 tests), `api/skill-combo/route.ts` (auto-insert unlock baru), `app/skill-combo` |
| 16 | Real-Life Mission | Selesai | `lib/ai/prompts/realLifeMission.ts`, `api/mission/route.ts` (GET/POST/PATCH), `app/misi` |
| 17 | Zona Nyaman Breaker | Selesai (bagian dari #16) | `api/mission/route.ts` — set `category: "zona_nyaman_breaker"` saat POST dengan `isZonaNyamanBreaker: true` |

### F. Perspektif & Wawasan Luas
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 18 | Global Mentor Rotation | Selesai | `lib/ai/prompts/globalMentor.ts`, `api/mentor/route.ts` (streaming, persists ke `aiMessages`), `app/mentor` — 6 persona + selector |
| 19 | Bahasa & Peribahasa Dunia | Selesai (konten statis) | `app/peribahasa/page.tsx` — 20 peribahasa dari 15+ budaya, dikurasi manual, tanpa AI (mencegah risiko halusinasi atribusi) |
| 20 | Skenario Lintas Budaya | Selesai | `lib/ai/prompts/crossCulturalScenario.ts` (8 konteks budaya), `api/lintas-budaya/scenario/route.ts`, `app/lintas-budaya` — kolom `culturalContext` di `instingScenarios`, submit reuse `/api/insting/submit` |
| 21 | World Perspective Log | Selesai | `api/world-perspective/route.ts` (GET/POST, tanpa AI), `app/perspektif` |

### G. Refleksi & Jangka Panjang
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 22 | Decision Journal Otomatis | Selesai | `api/journal/route.ts`, `app/journal` |
| 23 | Kompas 5 Tahun | Selesai | `app/kompas`, `api/onboarding`. Alignment check tiap 20 level sudah ada di `api/core-session/route.ts` — trigger AI note non-fatal saat POST level kelipatan 20, ditampilkan di `app/sesi-inti` |
| 24 | Reflection Level | Selesai | `api/reflection/route.ts` (GET/POST), `app/reflection` — form + history, linked dari `sesi-inti` saat `isReflectionLevel` |
| 25 | Future Self Simulator | Selesai | `lib/ai/prompts/futureSelfSimulator.ts`, `api/future-self/route.ts`, `app/future-self` — disclaimer simulasi wajib di UI |
| 26 | Brutal Honesty Report | Selesai | `lib/ai/prompts/brutalHonesty.ts`, `api/brutal-honesty/route.ts`, `app/brutal-honesty` — data dihitung dulu di kode, baru dimasukkan ke prompt |
| 27 | Blueprint 1-5-10 Tahun | Selesai (bagian dari Kompas) | `app/kompas/page.tsx`, field `blueprintBisnis` di `userProfiles` |
| 28 | Kematangan Kepribadian | Selesai | `lib/ai/prompts/personalityMaturity.ts`, `api/personality-maturity/route.ts`, `app/kepribadian` — laporan bulanan dari entri jurnal 30 hari, dibanding 30 hari sebelumnya |

### H. Kesehatan & Perawatan Diri (data real wajib dulu)
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 29 | Asupan Protein & Bentuk Tubuh | Selesai | `lib/ai/prompts/healthAdvice.ts`, `api/health-advice/route.ts?type=protein`, `app/kesehatan` — guard: cek `healthProfiles` ada dulu, AI hanya beri rentang estimasi bukan angka pasti |
| 30 | Perawatan Wajah | Selesai | `api/health-advice/route.ts?type=skin`, tab kedua di `app/kesehatan` — AI hanya arahan umum, selalu sarankan cek BPOM |
| 31 | Kebersihan Diri (checklist) | Selesai | `api/hygiene/route.ts` (upsert harian), `app/kebersihan` — 10 item checklist statis + log mingguan, tanpa AI |

### I. Ibadah & Keuangan (data real wajib dulu)
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 32 | Pengingat Ibadah | Selesai | `api/prayer-times/route.ts` (Aladhan API, GET/POST profil), `app/ibadah` — return 503 jujur kalau API gagal, tidak pernah mengarang jadwal |
| 33 | Atur Keuangan | Selesai | `lib/ai/prompts/financeAdvice.ts`, `api/finance-advice/route.ts`, `app/keuangan` — guard: cek `financeProfiles` ada dulu, tidak pernah menyebut harga saham/aset |

### J. Sistem Prestise
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 34 | Diamond Tier System | Selesai | Mekanisme inti (`lib/engine/diamondTier.ts`), Diamond Vault (`api/diamond-vault/route.ts`, `app/diamond-vault`), Diamond Mentor Unlock: persona `diamond_tegas` di `globalMentor.ts`, GET `/api/mentor` return `hasDiamondUnlock`, POST guard tolak kalau belum ada checkpoint, UI terkunci/terbuka di `app/mentor` |

### K. Kamus Pribadi
| # | Fitur | Status | Lokasi |
|---|---|---|---|
| 35 | Auto-Simplifier / Kamus Pribadi | Selesai | `api/dictionary/simplify`, `app/kamus` |

### Modul Terpisah — Akademi Analisis Saham
| Bagian | Status | Lokasi |
|---|---|---|
| Kategori Fundamental, Level 1-5 + 1 studi kasus | Selesai | `content/stockFundamentalLevels.ts`, `app/akademi-saham` |
| Kategori Teknikal, Level 1-5 | Selesai | `content/stockTechnicalLevels.ts`, seeded ke DB |
| Kategori Makro-Sektoral, Level 1-5 | Selesai | `content/stockMacroLevels.ts`, seeded ke DB |
| Kategori Sentimen & Berita, Level 1-5 | Selesai | `content/stockSentimentLevels.ts`, seeded ke DB |
| Kategori Manajemen Risiko, Level 1-5 | Selesai | `content/stockRiskLevels.ts`, seeded ke DB |
| Kategori Legal & Compliance, Level 1-5 | Selesai | `content/stockLegalLevels.ts`, seeded ke DB |
| Investor Coach chat, anti-halusinasi, disclaimer | Selesai | `lib/ai/prompts/investorCoach.ts`, `api/investor/chat` |

**Legenda status:** Selesai · Sebagian (fondasi ada, perlu dilanjutkan) · Belum ada

---

## Fitur yang sengaja di-skip (butuh keputusan terpisah)

- **#7, #8, #10** (Voice/audio features) — butuh keputusan produk soal privasi audio user. Pilihan: (a) Web Speech API browser (transcribe di client, tidak ada audio dikirim ke server), (b) MediaRecorder + kirim ke model via OpenRouter. Schema DB sudah ada, tinggal putuskan pendekatan.
- **#13** (Silent Mode / Push Notification) — butuh service worker + Web Push API, di luar scope Next.js App Router biasa. Bisa ditambah jika app di-PWA-kan.

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
6. **useEffect pattern** — JANGAN panggil setState secara synchronous di
   awal fungsi yang di-pass ke `useEffect`. Semua setState harus ada di dalam
   `.then()`/`.catch()` callback. Contoh yang benar:
   ```ts
   function load() {
     fetch("/api/...").then(r => r.json()).then(d => setState(d)).catch(() => {});
   }
   useEffect(load, []);
   ```
7. Jalankan `npm run typecheck && npm run lint && npm test && npm run build`
   sebelum menganggap fitur selesai — proyek ini sudah bersih dari error di
   keempatnya, jaga supaya tetap begitu.

## Quirks Termux/Android yang perlu diingat

- **`npm run dev`** harus pakai `--webpack` (sudah ada di package.json) — Turbopack tidak support android/arm64.
- **`npm run build`** sama — sudah pakai `--webpack`.
- **`npm run db:seed`** pakai `--env-file .env.local` (sudah ada di package.json) — `tsx` tidak auto-load `.env.local`.
- **tsconfig.json** dan **eslint.config.mjs** sudah exclude file Expo di root (`app/`, `components/`, `App.tsx`, `metro.config.js`) yang berbagi direktori yang sama dengan proyek Next.js.

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
