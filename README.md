# 🎓 Sistem Prioritas Maintenance Berbasis K-Means Clustering

![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Backend-Python_Flask-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/ML-Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

> **Judul :** Pemetaan Tingkat Kerusakan Perangkat Elektronik Pada Mitra Alfamart Menggunakan Algoritma K-Means Clustering Untuk Prioritas Maintenance.

## 🖼️ Tampilan Aplikasi

| Dashboard Utama | Peta Sebaran (GIS) |
| :---: | :---: |
| ![Dashboard Preview](https://via.placeholder.com/600x350.png?text=Dashboard+Utama+Preview) | ![Map Preview](https://via.placeholder.com/600x350.png?text=Peta+GIS+Preview) |
| *Ringkasan Statistik & K-Means* | *Visualisasi Lokasi Toko* |

---

## 📖 Deskripsi Proyek

Aplikasi ini dirancang untuk membantu **CV. Berkarya Satu Tujuan** dalam menentukan prioritas perbaikan perangkat elektronik di ribuan gerai mitra. Sistem mengolah data historis **BAP (Tiket Kerusakan)** dan **Invoice Biaya** menggunakan algoritma **Machine Learning (K-Means Clustering)**.

Tujuan utamanya adalah mengelompokkan toko menjadi 3 klaster prioritas:
1.  🔴 **High Priority:** Frekuensi kerusakan tinggi & Biaya perbaikan mahal (High Cost).
2.  🟡 **Medium Priority:** Kondisi kerusakan dan biaya sedang.
3.  🟢 **Low Priority:** Jarang rusak & biaya rendah (Low Cost).

---

## ⚠️ Disclaimer: Akurasi Peta (GIS)

> **Catatan Penting untuk Penguji/Pengguna:**
>
> Fitur **Peta Sebaran (GIS)** pada versi ini masih dalam tahap **Preview / Prototype**.
>
> 1.  **Keterbatasan Data Alamat:** Data alamat mentah dari sistem lama tidak terstruktur (unstructured text), sehingga proses *Geocoding* otomatis sering kali meleset atau tidak menemukan titik koordinat yang presisi.
> 2.  **Kendala Waktu:** Untuk mencapai akurasi 100%, diperlukan proses validasi manual satu per satu terhadap ribuan data toko, yang memakan waktu di luar lingkup penelitian saat ini.
> 3.  **Pengembangan Lanjut:** Saat ini peta digunakan sebagai **visualisasi indikatif**. Perbaikan akurasi koordinat GPS akan dilakukan pada tahap pengembangan sistem selanjutnya (Future Work).

---

## 🛠️ Fitur Utama

* ✅ **Dashboard Real-time:** Menampilkan total tiket, total biaya, dan jumlah toko prioritas.
* ✅ **Clustering Otomatis:** Menggunakan K-Means untuk membagi toko berdasarkan *Frequency* & *Monetary*.
* ✅ **Peta Interaktif:** Visualisasi sebaran toko dengan warna marker sesuai prioritas.
* ✅ **Filtering Wilayah:** Filter data berdasarkan Zona (Bandung, Garut, Tasikmalaya, dll).
* ✅ **Manajemen Data Aman:** Integrasi Google Sheets tanpa merusak data asli (menggunakan `gps_store.json` lokal).

---

## 🎓 Panduan Penyusunan Laporan Skripsi

Bagian ini adalah catatan khusus untuk penyusunan dokumen Bab 2 (Landasan Teori) dan Bab 3/4 (Metodologi & Pembahasan) agar sinkron dengan kode program.

### 1. Landasan Teori yang Wajib Ada (Bab 2)
Pastikan Anda mencari referensi buku/jurnal untuk topik berikut:
* **Data Mining:** Definisi, tahapan KDD (Knowledge Discovery in Databases).
* **Clustering:** Konsep *Unsupervised Learning*.
* **Algoritma K-Means:** Cara kerja, penentuan Centroid, dan iterasi.
* **RFM Analysis:** Fokus pada dimensi **Frequency** (Jumlah Laporan) dan **Monetary** (Total Biaya) yang digunakan di aplikasi ini.
* **Euclidean Distance:** Rumus jarak yang digunakan K-Means.
* **Z-Score Normalization (Standard Scaler):** Sangat penting karena di kode kita menggunakan `StandardScaler`.

### 2. Rumus-Rumus yang Digunakan (Bab 3)
Di laporan, jangan hanya tulis rumus K-Means biasa. Tuliskan rumus spesifik yang ada di kode `app.py`:

**A. Normalisasi Data (Standard Scaler)**
Sebelum masuk K-Means, data biaya (jutaan) dan frekuensi (satuan) disetarakan skalanya menggunakan Z-Score:
$$z = \frac{x - \mu}{\sigma}$$
*Dimana:*
* $x$ = Nilai asli (misal: Biaya Rp 100jt).
* $\mu$ = Rata-rata (Mean) dari seluruh data.
* $\sigma$ = Standar Deviasi.

**B. Jarak Euclidean (Euclidean Distance)**
Untuk mengukur jarak data toko ke titik pusat cluster (Centroid):
$$d(p,q) = \sqrt{\sum_{i=1}^{n} (q_i - p_i)^2}$$
*Dalam kasus ini:*
$$d = \sqrt{(Freq_{toko} - Freq_{centroid})^2 + (Biaya_{toko} - Biaya_{centroid})^2}$$

### 3. Alur Logika Program (Flowchart)
1.  **Input:** Baca data Google Sheets (Tab BAP & DETAIL).
2.  **Cleaning:**
    * Gabung tabel berdasarkan `NO BAP`.
    * **Penting:** Bersihkan format uang (`Rp 150.000,00` -> `150000`).
3.  **Transformasi:** Hitung Total Frekuensi & Total Biaya per Toko.
4.  **Normalisasi:** Scaling data menggunakan Standard Scaler.
5.  **Modeling:** Penerapan K-Means ($k=3$).
6.  **Labeling:**
    * Cluster rata-rata biaya tertinggi -> **High**.
    * Cluster rata-rata biaya terendah -> **Low**.
7.  **Mapping:** Gabung hasil cluster dengan koordinat GPS dari `gps_store.json`.
8.  **Output:** JSON API untuk Frontend.

---

## 🚀 Cara Menjalankan Aplikasi

### A. Persyaratan Sistem
* Node.js (v18+)
* Python (v3.10+)
* Google Cloud Service Account (`credentials.json`)

### B. Menjalankan Backend (Python)
```bash
# 1. Masuk folder root & Install library
pip install flask flask-cors pandas scikit-learn gspread oauth2client geopy

# 2. Pastikan file credentials.json & gps_store.json sudah ada

# 3. Jalankan Server
python app.py

```

### C. Menjalankan Frontend (React)

```bash
# 1. Masuk folder frontend
cd frontend

# 2. Install dependency (jika belum)
npm install

# 3. Jalankan Vite Server
npm run dev

```

---

## 🙈 .gitignore (File yang WAJIB Di-ignore)

Jangan pernah meng-upload file berikut ke GitHub/GitLab publik:

```text
# Python
__pycache__/
*.pyc
venv/
env/

# Node Modules
node_modules/
dist/

# Security & Data (SANGAT PENTING)
credentials.json
.env
gps_store.json  <-- Opsional: Boleh di-commit jika ingin simpan data GPS, tapi ignore jika ingin generate ulang.

```

**Developed by:** Muhamad Ikbal Handini
**Program Studi:** Teknik Informatika
**Tahun:** 2026
