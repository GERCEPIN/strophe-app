# STROPHE — The Turning Point

Aplikasi self-mastery harian pribadi untuk Sjupa. Bukan game — sistem
transformasi diri serius: satu "Putaran" (level) per hari, terukur lewat
tiga angka terpisah (Level, Skor Mental, Growth Index — lihat
`TECHNICAL_SPEC.md` §2 untuk kenapa tiga, bukan satu).

Status saat ini: **Phase 1 selesai** — engine inti, penyimpanan lokal, AI
Coach, dan alur Onboarding → Dashboard → Sesi → Pengaturan semuanya
berfungsi dan teruji (48 test, semua hijau). Level 1-5 Sesi Inti sudah
ditulis tangan; level 6+ masih memakai pola Level 5 sebagai placeholder
sampai Phase 2 (generasi konten dinamis lewat AI Coach) dikerjakan — lihat
`CLAUDE.md` untuk roadmap lengkap.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka URL yang tercetak (biasanya `http://localhost:5173`) di Chrome.

## Test & build

```bash
npm run test:run   # 48 test — engine, storage, AI Coach client
npm run build       # type-check penuh + build produksi + PWA manifest/service worker
npx oxlint            # linter, 0 warning/error saat ini
```

Jalankan `npm run test:run` sebelum dan sesudah perubahan apa pun. Semua
test hijau itu standar minimum, bukan tujuan akhir.

## Cara sampai ke HP Android

Aplikasi ini PWA (Progressive Web App) — sengaja, bukan project Android
Studio/Gradle, supaya bisa dibangun sepenuhnya lewat Claude Code tanpa
butuh Android SDK di mana pun sesi itu berjalan. Lihat `TECHNICAL_SPEC.md`
§1 dan §8 untuk alasan lengkapnya.

1. **Push repo ini ke GitHub** (sudah `git init` + commit awal — tinggal
   `git remote add origin <url-repo-kamu> && git push -u origin main`).
2. **Deploy folder `dist/` ke static host.** Termudah: GitHub Pages (gratis,
   tidak perlu akun lain di luar GitHub) — minta Claude Code menyiapkan
   GitHub Actions workflow yang menjalankan `npm run build` lalu publish
   `dist/` ke branch `gh-pages`. Alternatif yang sama mudahnya: Vercel
   atau Netlify (`vercel --prod` / `netlify deploy --prod` setelah link
   repo).
3. **Buka URL hasil deploy di Chrome di HP Android.**
4. **Menu Chrome → "Add to Home screen" / "Install app".** Ini yang
   membuatnya terasa seperti aplikasi terpasang (ikon sendiri, tanpa
   address bar, bisa dibuka offline untuk konten statis).
5. **Buka Pengaturan di dalam app, masukkan Anthropic API key** (dari
   console.anthropic.com), tap "Simpan & Tes Koneksi" untuk memastikan AI
   Coach benar-benar tersambung.

## Keterbatasan yang perlu diketahui (bukan disembunyikan)

- **Notifikasi pengingat di Android bersifat usaha terbaik, bukan
  jaminan.** PWA tidak bisa menjamin notifikasi presisi waktu seperti
  aplikasi native. Mitigasi nyata: Dashboard selalu menghitung ulang "apa
  yang jatuh tempo hari ini" setiap kali app dibuka — jadi notifikasi
  yang terlewat tidak pernah berarti kamu benar-benar kehilangan
  progres, cuma kehilangan pengingatnya. Detail lengkap: `TECHNICAL_SPEC.md`
  §6. Mitigasi praktis: matikan battery optimization untuk Chrome/app ini
  di pengaturan Android.
- **Fitur AI Coach butuh koneksi internet** dan API key kamu sendiri.
  Konten statis (Level 1-5, shell aplikasi) tetap bisa dibuka offline
  berkat service worker, tapi fitur yang memanggil AI Coach tidak.
- **"Voice Confidence Check" ke depannya hanya bisa menilai transkrip
  teks**, bukan nada suara asli — lihat `TECHNICAL_SPEC.md` §4.4 untuk
  kenapa, ini keterbatasan arsitektural yang jujur, bukan bug.

## Dokumen lain di repo ini

- `DESIGN_STROPHE.md` — spesifikasi produk lengkap (konsep, alur, konten
  Level 1-5, sistem reward, modul Akademi Analisis Saham).
- `TECHNICAL_SPEC.md` — keputusan arsitektur dan alasannya, per bagian
  §1-§9.
- `CLAUDE.md` — dibaca otomatis oleh Claude Code setiap sesi; roadmap
  Phase 2/3 dan batasan yang tidak boleh dilonggarkan ada di sini.
