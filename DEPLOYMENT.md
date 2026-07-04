# Deploy STROPHE ke Vercel

## 1. Siapkan database Neon

1. Daftar di https://neon.tech (gratis, tidak perlu kartu kredit untuk tier gratis).
2. Buat project baru, region terdekat (mis. Singapore untuk latensi ke Indonesia).
3. Di dashboard Neon, buka tab "Connection Details" dan salin **pooled
   connection string** (mengandung `-pooler` di hostname-nya — ini penting
   untuk lingkungan serverless seperti Vercel).

## 2. Jalankan migrasi ke database production

Dari Termux atau laptop mana pun yang sudah punya `.env.local` terisi
dengan `DATABASE_URL` Neon ini:

```bash
npm run db:migrate
npm run db:seed
```

(Kalau mau data dev/production terpisah, buat dua project Neon berbeda dan
ulangi langkah ini untuk masing-masing.)

## 3. Push ke GitHub

```bash
git add -A
git commit -m "Initial STROPHE build"
git remote add origin <url-repo-github-kamu>
git push -u origin main
```

## 4. Import ke Vercel

1. Buka https://vercel.com/new, pilih repo GitHub ini.
2. Framework preset otomatis terdeteksi sebagai Next.js — tidak perlu diubah.
3. Di bagian **Environment Variables**, tambahkan persis seperti isi
   `.env.local` kamu:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL` (opsional, ada default)
   - `NEXT_PUBLIC_APP_URL` — isi dengan domain Vercel kamu, mis.
     `https://strophe.vercel.app` (bisa diupdate lagi setelah deploy pertama
     kalau kamu pakai custom domain)
4. Klik **Deploy**.

## 5. Verifikasi

Setelah deploy selesai, buka domain Vercel-nya dan coba:
- Daftar akun baru
- Buka Sesi Inti, tandai selesai
- Buka Akademi Saham, coba tab "Tanya Coach" — kalau `OPENROUTER_API_KEY`
  benar, Coach akan membalas dengan disclaimer di pesan pertama.

Kalau ada error 500 terkait database, cek lagi bahwa connection string yang
dipakai adalah versi **pooled** (bukan direct connection) — Vercel functions
serverless butuh connection pooling.

## Catatan biaya

- Neon: tier gratis cukup untuk pengembangan & pemakaian personal (0.5 GB
  storage, auto-suspend saat idle).
- Vercel: tier Hobby gratis cukup untuk pemakaian personal.
- OpenRouter: berbayar per-token sesuai model yang dipilih — cek harga di
  https://openrouter.ai/models sebelum memilih model default. Model yang
  lebih murah bisa diset lewat `OPENROUTER_MODEL` tanpa ubah kode.
