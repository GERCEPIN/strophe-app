# Changelog

## Unreleased — Logo terintegrasi

Logo asli STROPHE (diunggah sebagai `1000316743.jpg`, mark abstrak hitam
gaya garis/blob yang melambangkan simpul-simpul yang saling terhubung —
selaras dengan konsep "titik balik") sekarang jadi identitas visual nyata
aplikasi, menggantikan spiral placeholder yang saya buat sebelumnya di
Phase 1.

### Yang berubah

- **Diolah dari 1 file JPEG 1280×1280 (hitam di atas putih) jadi 6 aset
  ikon PNG**, lewat threshold + trim + rekolorisasi terprogram (bukan
  ditelusuri manual) — lihat `scripts/` note di bawah kalau proses ini
  perlu diulang untuk logo versi lain nanti.
- **Direkolorisasi dari hitam ke emas (`#C9A24B`)** supaya konsisten
  dengan token desain yang sudah dipakai di seluruh app (`index.css`,
  `LevelSpiral.tsx`) — mark hitam di atas latar gelap aplikasi akan
  nyaris tak terlihat, jadi ini bukan sekadar preferensi, tapi keperluan
  kontras.
- **Dua varian dibuat, sesuai spesifikasi PWA manifest:**
  - `icon-any-*.png` — latar transparan, isi ~85% kanvas (dipakai untuk
    konteks yang tidak di-crop OS).
  - `icon-maskable-*.png` — latar solid `#0B0B0F`, isi mark dikecilkan
    ke ~55-58% kanvas supaya aman di dalam *safe zone* ~80% yang
    disyaratkan spesifikasi maskable icon — Android boleh memotongnya
    jadi lingkaran/rounded-square, mark tidak akan terpotong.
  - Plus `apple-touch-icon.png` (180×180, gaya sama dengan maskable) dan
    `favicon.png` (48×48).
- **`vite.config.ts`** — manifest icons array diupdate menunjuk ke PNG
  asli dengan `purpose: 'any'` / `'maskable'` yang benar (sebelumnya satu
  SVG placeholder dipakai untuk keduanya sekaligus, yang secara teknis
  tidak ideal untuk maskable).
- **`index.html`** — favicon & apple-touch-icon link diarahkan ke aset
  baru.
- **`Onboarding.tsx` & `Dashboard.tsx`** — mark logo asli sekarang tampil
  langsung di header, bukan cuma jadi ikon aplikasi di home screen.
- Placeholder SVG lama (`icon-192.svg`, `icon-512.svg`, `favicon.svg`)
  dihapus dari `public/`.

### Verifikasi

Karena image viewer sempat gagal saat proses ini (masalah tool
sementara, bukan masalah file — sudah dicoba ulang beberapa kali), setiap
ikon diverifikasi programatis, bukan cuma "dijalankan tanpa error":
posisi bounding box mark emas dihitung ulang untuk memastikan benar-benar
center (offset ≤1px dari titik tengah kanvas di semua ukuran) dan
proporsi kanvas yang terisi sesuai target (any ~85%, maskable ~55-58%).
Setelah itu, `npm run build` dicek ulang untuk memastikan
`manifest.webmanifest` dan `dist/index.html` benar-benar mereferensikan
file yang benar dan filenya benar-benar tersalin ke `dist/` — bukan
diasumsikan.

`npm test` (48/48) dan `npx oxlint` (0 error) dijalankan ulang setelah
perubahan ini dan tetap hijau.
