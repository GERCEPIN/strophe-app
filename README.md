# STROPHE — The Turning Point

Sistem transformasi diri harian: disiplin, insting, daya ingat, komunikasi,
wawasan, dan Akademi Analisis Saham. Level tanpa batas, reset harian
bertahap, dan setiap fitur yang butuh data real (kesehatan, keuangan,
ibadah, harga saham) akan bertanya ke user dulu — tidak pernah mengarang.

## Stack

| Layer | Pilihan | Kenapa |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Satu project untuk frontend + backend (API routes), gampang deploy ke Vercel. |
| Bahasa | TypeScript | Type-safety di seluruh stack, termasuk schema DB. |
| Database | Postgres via [Neon](https://neon.tech) (serverless, HTTP driver) | **Sengaja bukan SQLite/Prisma** — binary engine-nya sering gagal di-download di lingkungan terbatas, dan native module (better-sqlite3 dkk) sering bermasalah dikompilasi di Termux/Android. Neon dipakai lewat `@neondatabase/serverless`, driver HTTP murni JS — jalan sama persis di Termux maupun di Vercel, tanpa kompilasi native sama sekali. |
| ORM | Drizzle ORM + Drizzle Kit | Pure JS/TS, tanpa binary terpisah yang perlu di-download (beda dari Prisma). |
| Auth | Custom (bcryptjs + jose JWT, httpOnly cookie) | Ringan, stateless, jalan di Node & Edge runtime tanpa provider config. |
| AI | [OpenRouter](https://openrouter.ai) | Satu API key untuk banyak model (termasuk Claude), gampang ganti model lewat env var. |
| Styling | Tailwind CSS v4 | Dark/gold premium theme kustom — lihat `src/app/globals.css`. |
| Testing | Vitest | Semua business logic inti (leveling, streak, spaced repetition, diamond tier) diuji sebagai pure functions. |

## Struktur proyek

```
src/
  db/
    schema.ts          — SATU sumber kebenaran untuk semua 33 tabel (mencakup ke-36 fitur)
    client.ts           — koneksi Neon (lazy-initialized)
    seed.ts              — seed konten Level 1-5
  lib/
    engine/              — business logic MURNI (tanpa DB/network) — leveling, streak,
                            spaced repetition, diamond tier. Semua diuji lewat Vitest.
    services/             — jembatan antara engine/ dan database
    ai/                    — client OpenRouter + semua system prompt (aturan anti-halusinasi
                             ada DI SINI, bukan cuma di deskripsi fitur)
    auth/                   — password hashing, session JWT
    validation/              — Zod schema untuk semua input
  content/                   — konten Level 1-5 yang di-seed (hand-authored, bukan AI)
  components/                 — UI components
  app/                          — halaman (App Router) + API routes
```

## Menjalankan di Termux

```bash
pkg update && pkg install nodejs git

git clone <url-repo-kamu>
cd strophe
npm install
```

### 1. Setup database (Neon — gratis)

1. Buat akun di https://neon.tech, buat project baru.
2. Copy connection string yang **pooled** (ada tulisan `-pooler` di host-nya).
3. `cp .env.example .env.local` lalu isi `DATABASE_URL` dengan connection
   string itu.

### 2. Setup secrets lain

```bash
# Generate session secret:
openssl rand -base64 32
# Tempel hasilnya ke SESSION_SECRET di .env.local

# Ambil API key OpenRouter di https://openrouter.ai/keys
# Tempel ke OPENROUTER_API_KEY di .env.local
```

### 3. Migrasi & seed database

```bash
npm run db:generate   # sudah pernah dijalankan, cuma perlu ulang kalau schema.ts berubah
npm run db:migrate    # menjalankan migrasi SQL ke Neon
npm run db:seed       # mengisi konten Level 1-5
```

### 4. Jalankan

```bash
npm run dev
```

Buka `http://localhost:3000` di browser HP kamu (Termux jalan sebagai
server lokal — browser Chrome/Firefox di HP yang sama bisa akses
`localhost:3000` langsung).

## Testing

```bash
npm test            # jalankan semua test sekali
npm run test:watch  # mode watch
npm run typecheck   # cek TypeScript tanpa build
npm run lint         # ESLint (termasuk React Compiler purity rules)
```

Semua logic inti (leveling, streak, spaced repetition, diamond tier) ada di
`src/lib/engine/` dan 100% diuji tanpa butuh database — aman dijalankan
kapan saja, termasuk di Termux tanpa koneksi ke Neon.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di [vercel.com](https://vercel.com), "Import Project" dari repo tersebut.
3. Tambahkan environment variables yang sama seperti `.env.local`
   (`DATABASE_URL`, `SESSION_SECRET`, `OPENROUTER_API_KEY`,
   `OPENROUTER_MODEL`, `NEXT_PUBLIC_APP_URL` — set ke domain Vercel kamu).
4. Deploy. Database Neon yang sama bisa dipakai untuk dev (Termux) dan
   production (Vercel) — atau buat branch/project Neon terpisah untuk
   production kalau mau data terpisah.

Detail lengkap ada di `DEPLOYMENT.md`.

## Melanjutkan pengembangan dengan Claude Code

Baca `CLAUDE.md` — dokumen itu memetakan ke-36 fitur ke status
implementasinya sekarang (selesai / parsial / belum) dan pola kode yang
harus diikuti untuk menambah masing-masing.

## Batasan yang jujur perlu diketahui

- **Konten Level 1-5 sudah nyata** (Sesi Inti, Memory Vault, Akademi Saham
  Fundamental) — di atas level 5, konten di-*recycle* dari level-level
  sebelumnya sampai lebih banyak konten ditambahkan. Ini ditandai jelas di
  API response (`contentRecycledFromEarlierLevel: true`) dan UI.
- **Jadwal sholat real (fitur #32) belum diintegrasikan ke API resmi** —
  skema database & halaman onboarding sudah menampung data lokasi user,
  tapi pemanggilan ke sumber resmi (mis. Aladhan API / Kemenag) belum
  ditulis. Lihat `CLAUDE.md` untuk cara menambahkannya dengan aman (tanpa
  mengarang jadwal kalau API gagal diakses).
- **Rekaman suara (Voice Confidence Check, English Shadow Mode) baru ada
  skema database-nya** — belum ada UI perekam & speech-to-text. Ini butuh
  keputusan tambahan (pakai Web Speech API browser, atau kirim audio ke
  model lewat OpenRouter) yang sebaiknya didiskusikan dulu sebelum
  diimplementasikan.
