# app.py (FINAL VERSION)
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import gspread
import json
import os
from oauth2client.service_account import ServiceAccountCredentials
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np

app = Flask(__name__)
CORS(app)  # Izinkan akses dari Frontend React

# --- KONFIGURASI ---
# Sesuaikan nama file credentials dan nama spreadsheet Anda
SHEET_NAME = "TEKNIK"
CREDENTIALS_FILE = "credentials.json"
GPS_FILE = "gps_store.json" # File database GPS hasil scan

# --- 1. KONEKSI & LOAD DATA ---
def get_google_sheet_data():
    try:
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
        client = gspread.authorize(creds)
        
        # Buka Spreadsheet
        sheet = client.open(SHEET_NAME)

        # Ambil Data dari Tab (Pastikan Nama Tab Benar)
        data_bap = pd.DataFrame(sheet.worksheet("BAP").get_all_records())
        data_detail = pd.DataFrame(sheet.worksheet("Detail Bap").get_all_records())
        data_toko = pd.DataFrame(sheet.worksheet("STORE").get_all_records())

        return data_bap, data_detail, data_toko
    except Exception as e:
        print(f"❌ Error Koneksi Google Sheets: {e}")
        return None, None, None

def load_local_gps():
    """Membaca database GPS lokal agar tidak membebani Google Maps"""
    if os.path.exists(GPS_FILE):
        with open(GPS_FILE, 'r') as f:
            return json.load(f)
    return {}

# --- 2. FUNGSI PEMBERSIH DATA (CRITICAL FIX) ---
def clean_currency(x):
    """
    Memperbaiki pembacaan format uang Indonesia.
    Input: "Rp 185.000.000,00"
    Output: 185000000.0 (Float)
    """
    if isinstance(x, str):
        # 1. Buang 'Rp', spasi, dan karakter aneh
        clean_str = x.replace('Rp', '').replace(' ', '').strip()
        
        # 2. Pisahkan Sen (angka di belakang koma)
        # Contoh: "185.000.000,00" -> ambil "185.000.000"
        if ',' in clean_str:
            clean_str = clean_str.split(',')[0]
            
        # 3. Hapus titik pemisah ribuan
        # Contoh: "185.000.000" -> "185000000"
        clean_str = clean_str.replace('.', '')
        
        # 4. Convert ke angka
        try:
            return float(clean_str)
        except ValueError:
            return 0.0
            
    # Jika sudah angka (int/float), langsung kembalikan
    return float(x) if x else 0.0

def detect_zone(address):
    """Mendeteksi Zona Wilayah dari Alamat"""
    if not isinstance(address, str): return "Lainnya"
    addr = address.upper()
    if "GARUT" in addr: return "Garut"
    if "CIMAHI" in addr: return "Cimahi"
    if "SUMEDANG" in addr: return "Sumedang"
    if "TASIK" in addr: return "Tasikmalaya"
    if "BANDUNG" in addr or "BDG" in addr: return "Bandung Raya"
    return "Lainnya"

# --- 3. API UTAMA ---
@app.route('/api/data', methods=['GET'])
def get_data():
    print("🔄 Memulai Analisis Data...")
    
    # A. Load Data
    bap, detail, toko = get_google_sheet_data()
    gps_data = load_local_gps()
    
    if bap is None:
        return jsonify({"error": "Gagal koneksi ke Google Sheets"}), 500

    try:
        # B. Cleaning & Merging
        # Pastikan key penghubung (NO BAP) bertipe string
        bap['NO BAP'] = bap['NO BAP'].astype(str)
        detail['NO BAP'] = detail['NO BAP'].astype(str)
        
        # Gabungkan Data Transaksi
        merged = pd.merge(bap, detail, on='NO BAP', how='inner')
        
        # TERAPKAN FIX MATA UANG DI SINI
        merged['HARGA SATUAN'] = merged['HARGA SATUAN'].apply(clean_currency)
        
        # C. Hitung Statistik per Toko (RFM Sederhana)
        store_stats = merged.groupby('KODE TOKO').agg({
            'NO BAP': 'nunique',       # Frequency: Jumlah Tiket Unik
            'HARGA SATUAN': 'sum'      # Monetary: Total Biaya
        }).reset_index()
        
        store_stats.columns = ['kode_toko', 'frequency', 'total_cost']

        # D. K-Means Clustering
        # Kita butuh minimal 3 data untuk membuat 3 cluster
        if len(store_stats) >= 3:
            # Standarisasi Data (Agar Frekuensi 5 tidak kalah dengan Biaya 100 Juta)
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(store_stats[['frequency', 'total_cost']])
            
            # Jalankan K-Means (3 Cluster)
            kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
            store_stats['cluster'] = kmeans.fit_predict(X_scaled)

            # E. Labeling Prioritas Otomatis
            # Urutkan cluster berdasarkan rata-rata Total Cost tertinggi
            cluster_avg = store_stats.groupby('cluster')['total_cost'].mean().sort_values(ascending=False)
            
            # Map: Rank 1 -> High, Rank 2 -> Medium, Rank 3 -> Low
            priority_map = {
                cluster_avg.index[0]: 'High Priority',
                cluster_avg.index[1]: 'Medium Priority',
                cluster_avg.index[2]: 'Low Priority'
            }
            store_stats['priority'] = store_stats['cluster'].map(priority_map)
        else:
            # Fallback jika data terlalu sedikit (Jarang terjadi)
            store_stats['priority'] = 'Low Priority'

        # F. Gabungkan dengan Profil Toko (Nama & Alamat)
        # Asumsi kolom kunci di tab STORE adalah 'KODE'
        final_df = pd.merge(store_stats, toko, left_on='kode_toko', right_on='KODE', how='left')
        
        final_df['NAMA TOKO'] = final_df['NAMA TOKO'].fillna('Unknown Store')
        final_df['zone'] = final_df['ALAMAT'].apply(detect_zone)

        # G. Mapping Koordinat GPS dari File JSON
        lats = []
        lngs = []

        for kode in final_df['kode_toko']:
            kode_str = str(kode)
            if kode_str in gps_data and gps_data[kode_str]['lat'] != 0:
                lats.append(gps_data[kode_str]['lat'])
                lngs.append(gps_data[kode_str]['lng'])
            else:
                lats.append(0) # Tandai 0 jika tidak ada GPS
                lngs.append(0)
        
        final_df['lat'] = lats
        final_df['lng'] = lngs

        # H. Filter Data untuk Tampilan Peta
        # Hanya kirim data yang punya koordinat ke frontend (opsional)
        # final_df = final_df[(final_df['lat'] != 0)] 

        # Format JSON Output
        result = final_df[[
            'kode_toko', 'NAMA TOKO', 'zone', 
            'frequency', 'total_cost', 'priority', 
            'lat', 'lng'
        ]].to_dict(orient='records')

        summary = {
            'total_tickets': int(merged['NO BAP'].nunique()),
            'total_cost': float(merged['HARGA SATUAN'].sum()),
            'high_priority_count': int(final_df[final_df['priority'] == 'High Priority'].shape[0]),
            'data': result
        }

        print(f"✅ Analisis Selesai. Total Cost Real: Rp {summary['total_cost']:,.0f}")
        return jsonify(summary)

    except Exception as e:
        print(f"❌ Error Processing: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Server Backend Berjalan pada Port 5000...")
    app.run(debug=True, port=5000)