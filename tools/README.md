# Client-Side Utility Suite

Proyek Vite terpisah untuk `tools.zevn.web.id`, dipisah dari hub di root repo.
Semua pemrosesan terjadi di browser: tidak ada file, teks, JWT, atau kata sandi
yang dikirim ke server.

## Menjalankan

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Daftar alat

| Rute | Alat |
| --- | --- |
| `/image` | Image compressor (WebP/JPG/PNG, resize, pratinjau ukuran). |
| `/format` | JSON formatter/minifier, SQL formatter, JWT decoder. `/json` dialihkan ke sini. |
| `/base64` | Encode/decode Base64 untuk teks dan file. |
| `/hash` | UUID v4 dan hash SHA-1/256/384/512. |
| `/qr` | QR generator + unduh PNG. |
| `/regex` | Regex tester dengan flag, highlight, dan grup tangkapan. |
| `/datetime` | Unix timestamp ↔ ISO 8601 ↔ waktu lokal. |
| `/diff` | Diff teks per baris (maks. 1200 baris per sisi). |
| `/csv` | CSV ↔ JSON dengan pilihan delimiter. |
| `/color` | HEX/RGB/HSL, tint & shade, rasio kontras WCAG. |
| `/password` | Generator kata sandi acak + estimasi entropi. |
| `/slug` | Slug generator dengan pemisah dan batas panjang. |

## Struktur

```
src/
  App.tsx            shell, registry TOOLS, routing History API, pintasan 1-9
  components/ui.tsx  Button, CopyButton, panel/input/textarea, ToolHeader
  hooks/useTheme.ts  dark/light dengan localStorage
  lib/               format, encoding, sql, csv, color, diff, text
  tools/             satu komponen per alat
```

Menambah alat: buat komponen di `src/tools/`, lalu daftarkan `{ path, key?, aliases?, name, tagline, Icon, Component }`
di array `TOOLS` pada `src/App.tsx`.

## Deploy

Deploy sebagai project Vercel terpisah dengan Root Directory `tools/`.
`vercel.json` di folder ini berisi rewrite SPA `/(.*) → /index.html` supaya deep
link tetap jalan setelah refresh.
