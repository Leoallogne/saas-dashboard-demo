# 📘 Panduan Lengkap Pengembangan Aplikasi MoveOps (Belajar di Rumah)

Panduan ini dibuat khusus untuk membantu Anda memahami, menjalankan, dan memodifikasi proyek **MoveOps Dashboard** ini secara mandiri di rumah.

---

## 🛠️ 1. Persiapan Awal (Prerequisites)

Sebelum mulai, pastikan komputer/laptop Anda di rumah sudah terinstal perangkat lunak berikut:

1. **Node.js (Versi 18 atau lebih baru)**
   * Berfungsi untuk menjalankan server lokal dan mengelola pustaka (*libraries*).
   * Unduh di: [nodejs.org](https://nodejs.org/) (Pilih versi **LTS**).
2. **Visual Studio Code (VS Code)**
   * Editor kode untuk memodifikasi file.
   * Unduh di: [code.visualstudio.com](https://code.visualstudio.com/).
3. **Git**
   * Untuk mengunduh (*clone*) dan mengirim (*push*) kode ke GitHub.
   * Unduh di: [git-scm.com](https://git-scm.com/).

---

## 🚀 2. Cara Menjalankan Proyek di Rumah

Ikuti langkah-langkah ini untuk menjalankan aplikasi pertama kali di laptop Anda:

### Langkah Awal: Buka Proyek di VS Code
1. Buka aplikasi **VS Code**.
2. Pilih menu **File > Open Folder**, lalu pilih folder proyek `solar-dashboard-demo`.

### Langkah Kedua: Install Dependency & Jalankan
1. Buka Terminal di VS Code (Tekan tombol keyboard `` Ctrl + ` `` atau menu **Terminal > New Terminal**).
2. Jalankan perintah untuk menginstal pustaka yang dibutuhkan:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
4. Di terminal akan muncul alamat lokal seperti `http://localhost:5173`. Tahan tombol `Ctrl` dan klik tautan tersebut untuk membukanya di browser Anda.

---

## 🗺️ 3. Konfigurasi Google Maps API (Langkah Detail)

Agar peta interaktif dan pencarian alamat otomatis berfungsi, Anda harus memasukkan API Key dari Google Cloud Console:

1. Masuk ke [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru.
3. Masuk ke **API & Services > Library**, cari dan aktifkan ketiga API ini:
   * **Maps JavaScript API**
   * **Places API**
   * **Directions API**
4. Masuk ke **API & Services > Credentials**, klik **Create Credentials > API Key**.
5. Salin kunci API yang dihasilkan.
6. Di komputer rumah Anda, buka file bernama `.env` di folder proyek terluar.
7. Ganti nilai `VITE_GOOGLE_MAPS_API_KEY` menjadi kunci API Anda:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyDuaKunciAsliAndaDisini
   ```
8. Restart terminal (matikan dengan `Ctrl + C`, lalu jalankan `npm run dev` lagi).

---

## 📂 4. Memahami Struktur Kode Utama

Berikut adalah peta file penting agar Anda tahu di mana harus mengedit kode:

* **[src/App.jsx](file:///c:/Users/LEO%20SYAFIQ/OneDrive/Documents/solar-dashboard-demo/src/App.jsx)**: Pusat logika aplikasi. Semua *state* utama (data tugas, daftar truk, filter mata uang, nama perusahaan) dikelola di sini.
* **[src/components/ExecutiveDashboard.jsx](file:///c:/Users/LEO%20SYAFIQ/OneDrive/Documents/solar-dashboard-demo/src/components/ExecutiveDashboard.jsx)**: Tampilan dashboard utama yang berisi grafik keuangan, metrik logistik, dan widget kalkulator instan (*Quick Quote*).
* **[src/components/JobPipeline.jsx](file:///c:/Users/LEO%20SYAFIQ/OneDrive/Documents/solar-dashboard-demo/src/components/JobPipeline.jsx)**: Logika dan tampilan papan Kanban (Drag-and-Drop tugas).
* **[src/components/FleetScheduler.jsx](file:///c:/Users/LEO%20SYAFIQ/OneDrive/Documents/solar-dashboard-demo/src/components/FleetScheduler.jsx)**: Tampilan papan penjadwalan harian armada berdasarkan truk dan kalender mingguan.
* **[src/components/JobAuditLedger.jsx](file:///c:/Users/LEO%20SYAFIQ/OneDrive/Documents/solar-dashboard-demo/src/components/JobAuditLedger.jsx)**: Halaman audit pembukuan, faktur, filter margin, dan fitur pengiriman invois.
* **[src/data/mockData.js](file:///c:/Users/LEO%20SYAFIQ/OneDrive/Documents/solar-dashboard-demo/src/data/mockData.js)**: Tempat data simulasi (data awal tugas, truk, dan log aktivitas) disimpan.

---

## ✍️ 5. Latihan Mandiri untuk Belajar di Rumah

Untuk mengasah kemampuan koding Anda, cobalah lakukan latihan modifikasi kecil berikut:

### 🟢 Tingkat Mudah: Mengubah Data Simulasi Awal
* **Tantangan:** Tambahkan truk baru atau ganti nama driver default di aplikasi.
* **Caranya:** Buka file `src/data/mockData.js`, cari array `initialTrucks`. Ubah nama driver atau tambahkan objek truk baru dengan struktur yang sama.

### 🟡 Tingkat Sedang: Menyesuaikan Rumus Kalkulator Instan (*Quick Quote*)
* **Tantangan:** Ubah tarif dasar per kamar di kalkulator instan dari $350 menjadi $400.
* **Caranya:** Buka `src/components/ExecutiveDashboard.jsx`, cari fungsi `calculateQuote`. Ubah angka perkalian `quoteRooms` dari `350` menjadi `400`.

### 🔴 Tingkat Mahir: Menambahkan Kolom Baru di Form Pendaftaran Tugas
* **Tantangan:** Tambahkan kolom input "Diskon (%)" saat membuat tugas baru.
* **Caranya:**
  1. Buka `src/components/AddJobModal.jsx`.
  2. Tambahkan variabel `discount` di state `formData`.
  3. Tambahkan elemen `<input type="number">` baru di form HTML-nya.
  4. Sesuaikan fungsi `handleSubmit` agar nilai diskon ikut terkirim ke dalam objek tugas baru.

---

## 💾 6. Perintah Git yang Sering Digunakan

Jika Anda melakukan perubahan dan ingin menyimpannya ke GitHub dari komputer rumah:

1. **Mengecek file yang berubah:**
   ```bash
   git status
   ```
2. **Menyiapkan file untuk disimpan:**
   ```bash
   git add .
   ```
3. **Membuat catatan perubahan:**
   ```bash
   git commit -m "Catatan: menulis apa yang Anda ubah"
   ```
4. **Mengirim ke GitHub:**
   ```bash
   git push origin main
   ```
