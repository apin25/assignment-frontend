# resources-file-fe

Aplikasi frontend yang dibangun dengan Vue 3, Vite, dan Tailwind CSS untuk mengelola sumber daya file. Proyek ini berfungsi sebagai _user interface_ untuk proyek **Scele-ng modul Resources**.

➡️ Link FE : http://3.90.71.152:30189/

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).


## Fitur Utama
- Melihat daftar file dengan pagination dan filter.

- Filter berdasarkan nama file, owner, dan rentang tanggal.

- Opsi untuk menampilkan file yang sudah di-_soft-delete_.

- Mengupload file baru.

- Mengedit nama file.

- Melakukan _soft-delete_ pada file.


## Technology
- **Framework:** Vue 3 (Composition API dengan `<script setup>`)

- **Build Tool:** Vite

- **Language:** TypeScript

- **Styling:** Tailwind CSS

- **Routing:** Vue Router

- **Manager Paket:** pnpm


## Prasyarat
Sebelum memulai, pastikan Anda telah menginstal:

- **Node.js** (disarankan versi LTS, misal: v20.x atau lebih baru)

- **pnpm** (bisa diinstal dengan `npm install -g pnpm`)

- Pastikan server backend sudah berjalan (di `http://localhost:5914`).


## Project Setup and Configuration

### Install Dependencies

```sh
pnpm install
```


### Setup Awal (Referensi)
- **Install Tailwind CSS dan dependensinya:**
```sh
pnpm add -D tailwindcss@3 postcss@latest autoprefixer@latest
```

- **Generate file konfigurasi Tailwind dan PostCSS:**
```sh
pnpm exec tailwindcss init -p
```

- **Install paket ikon (Lucide + Pinia):**
```sh
pnpm add lucide-vue-next
```
```sh
pnpm install pinia
```


### Run Applications
- **Pastikan server backend Anda sudah berjalan.**

- **Jalankan server pengembangan Vite:**

```sh
pnpm run dev
```


### Type-Check, Compile and Minify for Production

- `pnpm run build`: Meng-kompilasi dan meminifikasi aplikasi untuk produksi.

- `pnpm run preview`: Menjalankan server lokal untuk melihat hasil build produksi.

- `pnpm run lint`: Menjalankan ESLint untuk memeriksa kesalahan pada kode.


## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
