
# 🎓 Sistem Prioritas Maintenance Berbasis K-Means Clustering

![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Backend-Python_Flask-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/ML-Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

> **Judul Skripsi:** Pemetaan Tingkat Kerusakan Perangkat Elektronik Pada Mitra Alfamart Menggunakan Algoritma K-Means Clustering Untuk Prioritas Maintenance.

---

## 🖼️ Tampilan Aplikasi

| Dashboard Utama | Peta Sebaran (GIS) |
| :---: | :---: |
| ![Dashboard Preview](https://via.placeholder.com/600x350.png?text=Dashboard+Utama+Preview) | ![Map Preview](https://via.placeholder.com/600x350.png?text=Peta+GIS+Preview) |
| *Ringkasan Statistik & K-Means* | *Visualisasi Lokasi Toko* |

---

## 📖 Deskripsi Proyek

Aplikasi ini dibangun untuk membantu **CV. Berkarya Satu Tujuan** dalam mengelola prioritas perbaikan aset elektronik (Printer, UPS, Boiler, dll) di ribuan gerai Alfamart.

Sistem mengolah data historis **BAP (Berita Acara Pemeriksaan)** dan **Invoice Biaya** menggunakan algoritma **Machine Learning (K-Means Clustering)** untuk mengelompokkan toko menjadi 3 prioritas:

1.  🔴 **High Priority:** Toko dengan frekuensi kerusakan tinggi & biaya perbaikan besar (High Cost).
2.  🟡 **Medium Priority:** Toko dengan tingkat kerusakan dan biaya sedang.
3.  🟢 **Low Priority:** Toko yang jarang rusak & biaya rendah (Low Cost).

---

## ⚠️ Disclaimer: Akurasi Peta (GIS)

> **Catatan Penting untuk Penguji/Pengguna:**
>
> Fitur **Peta Sebaran (GIS)** pada versi ini masih dalam tahap **Preview / Prototype**.
>
> 1.  **Keterbatasan Data Alamat:** Data alamat mentah dari sistem lama berbentuk teks tidak terstruktur (*unstructured text*), sehingga proses konversi ke koordinat GPS (*Geocoding*) otomatis memiliki tingkat kegagalan tertentu.
> 2.  **Solusi Saat Ini:** Sistem menggunakan database koordinat semi-otomatis (`gps_store.json`) yang telah divalidasi sebagian.
> 3.  **Pengembangan Lanjut:** Untuk akurasi 100%, diperlukan proses validasi manual (survey lapangan/verifikasi titik) yang akan dilakukan pada pengembangan sistem selanjutnya (*Future Work*).

---

## 🛠️ Fitur Utama & Keunggulan

* ✅ **Dynamic Training (Train on Fly):** Model K-Means dilatih ulang secara otomatis *on-the-fly* setiap kali data diambil. Sistem selalu cerdas mengikuti data terbaru tanpa perlu upload model manual.
* ✅ **Dashboard Real-time:** Menampilkan total tiket, total biaya operasional, dan grafik klasterisasi.
* ✅ **Analisis RFM (Modified):** Menggunakan variabel *Frequency* (Jumlah Tiket) dan *Monetary* (Total Biaya).
* ✅ **Peta Interaktif:** Visualisasi sebaran toko dengan penanda warna (Merah/Kuning/Hijau) sesuai prioritas.
* ✅ **Filtering Wilayah:** Filter data spesifik untuk area Bandung Raya, Garut, Tasikmalaya, dll.

---

## 🎓 Panduan Penyusunan Laporan Skripsi (Bab 2, 3, 4)

Bagian ini berisi referensi teknis yang digunakan dalam kode program untuk dicantumkan dalam Laporan Akademik.

### 1. Metodologi: "Train on Fly" (Dynamic Modeling)
Aplikasi ini menerapkan konsep **Dynamic Training**, berbeda dengan aplikasi ML konvensional yang menggunakan model statis (`.pkl`).

**Alasan Penggunaan:**
* **Data Dinamis:** Data kerusakan bertambah setiap hari. Model statis akan cepat kadaluarsa (*obsolete*).
* **Adaptabilitas:** Dengan melatih ulang model setiap kali *request* data, algoritma K-Means dapat menyesuaikan titik pusat (*centroid*) klaster berdasarkan tren biaya terbaru secara *real-time*.
* **Efisiensi Maintenance:** Tidak diperlukan tenaga ahli AI untuk melakukan *re-training* manual secara berkala.

**Alur Proses (`app.py`):**
`Request API` $\rightarrow$ `Fetch Data Google Sheet` $\rightarrow$ `Cleaning & Scaling` $\rightarrow$ `Training K-Means (Fit)` $\rightarrow$ `Labeling` $\rightarrow$ `Response JSON`.

### 2. Rumus & Algoritma

**A. Normalisasi Data (Standard Scaler)**
Data biaya (puluhan juta) dan frekuensi (satuan) memiliki skala yang jauh berbeda. Untuk mencegah bias, dilakukan normalisasi Z-Score:
$$z = \frac{x - \mu}{\sigma}$$
*Keterangan: $x$ = nilai asli, $\mu$ = rata-rata, $\sigma$ = standar deviasi.*

**B. K-Means Clustering (Euclidean Distance)**
Jarak antar data toko ke pusat klaster (*centroid*) dihitung menggunakan Euclidean Distance:
$$d(p,q) = \sqrt{\sum_{i=1}^{n} (q_i - p_i)^2}$$
Dalam konteks ini:
$$d = \sqrt{(Freq_{toko} - Freq_{centroid})^2 + (Biaya_{toko} - Biaya_{centroid})^2}$$

### 3. Landasan Teori (Keyword Pencarian)
* **Knowledge Discovery in Databases (KDD):** Proses ekstraksi pola dari data.
* **Unsupervised Learning:** Teknik ML tanpa data latih berlabel.
* **Elbow Method:** (Opsional) Metode menentukan jumlah cluster optimal (kita menggunakan $k=3$ berdasarkan kebutuhan bisnis: High, Medium, Low).

---

## 🚀 Cara Menjalankan Aplikasi

### A. Persyaratan Sistem
* Node.js (v18 ke atas)
* Python (v3.10 ke atas)
* Koneksi Internet (untuk Google Sheets & Maps API)

### B. Menjalankan Backend (Python Flask)
Backend bertugas menarik data, membersihkan format uang, melatih model AI, dan mengirim JSON.

```bash
# 1. Masuk folder root proyek
# 2. Install library yang dibutuhkan
pip install flask flask-cors pandas scikit-learn gspread oauth2client geopy

# 3. Jalankan Server
python app.py

```

> **Catatan:** Tunggu pesan "🚀 Server Backend Berjalan..." di terminal.

### C. Menjalankan Frontend (React Vite)

Frontend bertugas menampilkan Dashboard UI yang user-friendly.

```bash
# 1. Buka terminal baru, masuk folder frontend
cd frontend

# 2. Install dependency
npm install

# 3. Jalankan Server Frontend
npm run dev

```

> **Akses:** Buka browser dan kunjungi alamat yang muncul (biasanya `http://localhost:5173`).

---

## 🙈 .gitignore (File yang Diabaikan)

File-file berikut **TIDAK** di-upload ke repository publik demi keamanan:

```text
# Python
__pycache__/
*.pyc
venv/
env/

# Node Modules
node_modules/
dist/

# Security & Data Privasi
credentials.json    <-- Kunci akses Google Cloud (RAHASIA)
.env
gps_store.json      <-- Database GPS lokal

```

---

**Developed by:** Muhamad Ikbal Handini
**Program Studi:** Teknik Informatika
**Tahun:** 2026

```
