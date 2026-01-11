import json
import os
import re
import time
import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

# --- KONFIGURASI ---
SHEET_NAME = "TEKNIK"
CREDENTIALS_FILE = "credentials.json"
JSON_FILE = "gps_store.json"

# Batas Wilayah Jawa Barat (Agar tidak nyasar ke luar negeri)
BOUNDS = {
    "lat_min": -8.5, "lat_max": -5.5,
    "lng_min": 106.0, "lng_max": 109.5
}

def connect_google_sheet():
    print("🔌 Menghubungkan ke Google Sheets...")
    try:
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
        client = gspread.authorize(creds)
        sheet = client.open(SHEET_NAME)
        return sheet.worksheet("STORE")
    except Exception as e:
        print(f"❌ Gagal Koneksi: {e}")
        exit()

def clean_address(text):
    """Membersihkan alamat dari kata-kata 'sampah'"""
    if not isinstance(text, str): return ""
    text = re.sub(r'(?i)\b(no\.?|nomor|blok|kav\.?|rt\.?|rw\.?|ds\.?|desa|kel\.?|kelurahan|kec\.?|kecamatan|kab\.?|kabupaten|samping|depan|seberang|dekat)\b\s*\d*', '', text)
    text = re.sub(r'[^\w\s,]', '', text) 
    return " ".join(text.split())

def is_valid_location(lat, lng):
    return (BOUNDS["lat_min"] <= lat <= BOUNDS["lat_max"]) and \
           (BOUNDS["lng_min"] <= lng <= BOUNDS["lng_max"])

# --- MAIN PROGRAM ---
worksheet = connect_google_sheet()
data = worksheet.get_all_records()
df = pd.DataFrame(data)

# Hitung Total Data untuk Progres
total_data = len(df)

# Setup Geocoder
geolocator = Nominatim(user_agent="skripsi_geo_tracker_pro_v4")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1.5)

gps_data = {}
if os.path.exists(JSON_FILE):
    with open(JSON_FILE, 'r') as f:
        try: gps_data = json.load(f)
        except: gps_data = {}

print(f"\n🚀 Memulai Scan untuk {total_data} toko...")
print("🎯 Strategi: Nama Toko -> Alamat Bersih -> Jalan Saja -> Wilayah")
print("="*60)

success = 0
updated = 0
skipped = 0

for index, row in df.iterrows():
    # --- HITUNG PROGRES ---
    current = index + 1
    percent = (current / total_data) * 100
    
    # Deteksi Nama Kolom
    alamat_asli = row.get('ALAMAT') or row.get('Alamat') or row.get('alamat')
    kode_toko = str(row.get('KODE') or row.get('Kode') or row.get('KODE TOKO'))
    nama_toko = row.get('NAMA TOKO') or row.get('Nama Toko')
    
    if not alamat_asli or not kode_toko: continue

    # Skip jika sudah ada (Biar Cepat)
    if kode_toko in gps_data and gps_data[kode_toko]['lat'] != 0:
        # Print kecil saja biar tahu kalau lewat
        print(f"\r[{current}/{total_data}] {percent:.1f}% : {nama_toko} (Sudah Ada) - Skip", end="")
        skipped += 1
        continue

    # Jika belum ada, baru print baris baru
    print(f"\n[{current}/{total_data}] ({percent:.1f}%) 🔍 Memproses: {nama_toko}")
    
    alamat_bersih = clean_address(alamat_asli)
    
    queries = [
        f"{nama_toko}, Jawa Barat", 
        f"{alamat_bersih}, Jawa Barat",
        f"{' '.join(alamat_bersih.split()[:3])}, Jawa Barat"
    ]

    found = False
    for q in queries:
        try:
            loc = geocode(q)
            if loc and is_valid_location(loc.latitude, loc.longitude):
                gps_data[kode_toko] = {
                    "lat": loc.latitude, 
                    "lng": loc.longitude,
                    "src": q
                }
                print(f"      ✅ KETEMU via '{q}'")
                print(f"      📍 {loc.address[:50]}...")
                success += 1
                updated += 1
                found = True
                break
            else:
                if loc: print(f"      ⚠️ Luar Jabar: {loc.address[:30]}")
                
        except Exception as e:
            print(f"      ⚠️ Error: {e}")
    
    if not found:
        print(f"      ❌ GAGAL TOTAL.")
        gps_data[kode_toko] = {"lat": 0, "lng": 0}

    # Auto-Save tiap 5 data baru
    if updated > 0 and updated % 5 == 0:
        with open(JSON_FILE, 'w') as f: json.dump(gps_data, f, indent=4)

# Save Final
with open(JSON_FILE, 'w') as f: json.dump(gps_data, f, indent=4)

print("\n" + "="*60)
print(f"🏁 SELESAI! Total: {total_data}")
print(f"✅ Baru Ketemu: {updated}")
print(f"⏩ Dilewati (Sudah Ada): {skipped}")
print(f"📁 Database: {JSON_FILE}")