# zevn.web.id

Hub kecil berisi katalog alat yang tersebar di beberapa subdomain, plus suite alat
client-side di `tools/`.

## Isi repo

| Path | Isi |
| --- | --- |
| `src/` | Hub `zevn.web.id`: katalog kartu, pencarian, filter kategori, halaman `/licenses`. |
| `api/` | Serverless function Vercel untuk lisensi (Upstash Redis). |
| `tools/` | Proyek terpisah untuk `tools.zevn.web.id` — 12 alat yang seluruhnya berjalan di browser. |
| `public/` | Aset statis hub. |

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · lucide-react · Upstash Redis
(hanya untuk API lisensi).

## Menjalankan

```bash
npm install
npm run dev      # hub di http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

Untuk suite alat:

```bash
cd tools
npm install
npm run dev      # http://localhost:5173 (port bergeser kalau sudah dipakai)
```

## Environment variables

Salin `.env.example` menjadi `.env.local` (atau isi di dashboard Vercel).

| Variabel | Wajib | Kegunaan |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | ya, untuk `/api/license/*` | Endpoint REST database lisensi. |
| `UPSTASH_REDIS_REST_TOKEN` | ya, untuk `/api/license/*` | Token akses Upstash. |
| `ADMIN_SECRET` | ya, untuk admin | Dikirim sebagai header `x-admin-secret` saat mengelola lisensi. |

## API lisensi

| Endpoint | Method | Keterangan |
| --- | --- | --- |
| `/api/license/verify` | `POST` | Validasi + ikat lisensi ke perangkat. Body: `licenseKey`, `deviceId`, `hostname`, `app` (opsional). |
| `/api/license/admin` | `GET` | Daftar semua lisensi. Butuh header `x-admin-secret`. |
| `/api/license/admin` | `POST` | Aksi `create`, `toggle_status`, `reset_device`, atau `delete`. |

```bash
curl -X POST https://zevn.web.id/api/license/verify \
  -H 'content-type: application/json' \
  -d '{"licenseKey":"ZV-XXXX-XXXX","deviceId":"machine-id","hostname":"laptop"}'
```

Lisensi pertama kali dipakai akan terikat ke `deviceId` pengirim; perangkat lain
ditolak sampai device-nya di-reset lewat API admin.

## Client-Side Utility Suite (`tools/`)

Semua alat memproses data di tab pengguna — tidak ada file, teks, atau token yang
dikirim ke server.

| Rute | Alat |
| --- | --- |
| `/image` | Kompres gambar ke WebP/JPG/PNG + resize lebar maksimum. |
| `/format` (alias `/json`) | JSON formatter/minifier, SQL formatter, JWT decoder. |
| `/base64` | Base64 untuk teks dan file, dua arah. |
| `/hash` | UUID v4 massal + hash SHA-1/256/384/512. |
| `/qr` | QR generator dengan unduh PNG. |
| `/regex` | Regex tester dengan highlight kecocokan dan grup. |
| `/datetime` | Konversi unix timestamp, ISO 8601, dan waktu lokal. |
| `/diff` | Diff teks baris per baris. |
| `/csv` | Konversi CSV ↔ JSON. |
| `/color` | Konverter HEX/RGB/HSL + rasio kontras WCAG. |
| `/password` | Generator kata sandi dari Web Crypto. |
| `/slug` | Slug generator untuk URL. |

Pintasan angka `1`–`9` membuka alat pertama sampai kesembilan; sisanya lewat
sidebar.

## Deploy (Vercel)

1. **Hub** — impor repo ini sebagai project Vercel dengan root di root repo.
   Build command `npm run build`, output `dist`. Isi tiga environment variable di
   atas agar API lisensi hidup.
2. **Suite** — buat project Vercel **terpisah** dengan Root Directory `tools/`.
   Framework terdeteksi sebagai Vite, output `dist`. `tools/vercel.json` sudah
   memuat rewrite SPA supaya `/image`, `/format`, dan rute lain tidak 404 saat
   di-refresh.
3. Arahkan domain `tools.zevn.web.id` ke project suite tersebut, lalu pastikan
   sertifikatnya sudah terbit sebelum kartu di hub dipakai.
