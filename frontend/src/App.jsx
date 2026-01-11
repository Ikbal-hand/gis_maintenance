// File: src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Map, 
  Table, 
  AlertTriangle, 
  RefreshCw, 
  Filter, 
  Calendar,
  CheckCircle2,
  Building2
} from 'lucide-react';

// Import Komponen
import StatsCard from './components/StatsCard';
import MapComponent from './components/MapComponent';
import ClusterChart from './components/ClusterChart';

function App() {
  // --- STATE MANAGEMENT ---
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [selectedZone, setSelectedZone] = useState('All');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard'); // Untuk styling menu aktif

  // --- 1. AMBIL DATA DARI BACKEND ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/api/data');
      const result = response.data.data; 
      
      setAllData(result);
      applyFilter(result, selectedZone);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal koneksi ke Server Python!");
      setLoading(false);
    }
  };

  // --- 2. LOGIKA FILTER & UPDATE STATISTIK ---
  const applyFilter = (data, zone) => {
    let filtered = zone === 'All' ? data : data.filter(d => d.zone === zone);
    setDisplayData(filtered);
    
    setStats({
      total: filtered.length,
      high: filtered.filter(d => d.priority === 'High Priority').length,
      medium: filtered.filter(d => d.priority === 'Medium Priority').length,
      low: filtered.filter(d => d.priority === 'Low Priority').length,
    });
  };

  const handleZoneChange = (e) => {
    const zone = e.target.value;
    setSelectedZone(zone);
    applyFilter(allData, zone);
  };

  // --- 3. FUNGSI SCROLL NAVIGASI ---
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- LOADING SCREEN ---
  if (loading && allData.length === 0) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 flex-col">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 font-medium animate-pulse">Menghubungkan ke Satelit GPS & Database...</p>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9] font-sans text-slate-800">
      
      {/* ================= SIDEBAR (COMMAND CENTER) ================= */}
      <aside className="w-72 bg-[#0f172a] text-slate-300 hidden md:flex flex-col flex-shrink-0 shadow-2xl z-50 relative">
        
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-[#020617]">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">TURTLE TEAM<span className="text-blue-500">ML</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Maintenance System</p>
          </div>
        </div>

        {/* --- KONTROL FILTER (FITUR BARU) --- */}
        <div className="p-6 border-b border-slate-800 bg-[#1e293b]/50">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
            <Filter size={12} /> Filter Wilayah
          </label>
          <div className="relative">
            <select 
              value={selectedZone} 
              onChange={handleZoneChange} 
              className="w-full bg-[#334155] text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer border border-slate-600 shadow-inner"
            >
              <option value="All">🌍 Semua Wilayah</option>
              <option value="Bandung Raya">🏢 Bandung Raya</option>
              <option value="Garut">⛰️ Garut</option>
              <option value="Cimahi">🏭 Cimahi</option>
              <option value="Sumedang">🌲 Sumedang</option>
              <option value="Tasikmalaya">🕌 Tasikmalaya</option>
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">▼</div>
          </div>
        </div>
        
        {/* --- NAVIGASI AKTIF --- */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Navigasi Cepat</p>
          
          <button 
            onClick={() => scrollToSection('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} /> <span className="font-medium">Ringkasan</span>
            </div>
          </button>

          <button 
            onClick={() => scrollToSection('map-section')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'map-section' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Map size={18} /> <span className="font-medium">Peta GIS</span>
            </div>
          </button>

          <button 
            onClick={() => scrollToSection('table-section')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'table-section' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Table size={18} /> <span className="font-medium">Data Toko</span>
            </div>
            {/* Badge Jumlah Data */}
            <span className="bg-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-300">{stats.total}</span>
          </button>
        </nav>

        {/* --- MONITOR STATUS LIVE --- */}
        <div className="p-4 bg-[#0f172a] border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <AlertTriangle size={12} className="text-red-500" /> Status Kritis
            </h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">High Priority</span>
              <span className="text-lg font-bold text-red-400">{stats.high} Toko</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-red-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${(stats.high / stats.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-right">
              Butuh penanganan segera
            </p>
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 border border-slate-700 active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Refresh Data"}
          </button>
        </div>
      </aside>


      {/* ================= KONTEN UTAMA ================= */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        
        {/* HEADER SIMPLE */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 py-4 flex justify-between items-center border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dashboard Monitoring</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Calendar size={12} />
              <span>Update Terakhir: {lastUpdated.toLocaleTimeString('id-ID')} WIB</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-2">
                <CheckCircle2 size={14}/> Sistem Normal
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-white shadow-md"></div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24">
          
          {/* SECTION 1: RINGKASAN (ID: dashboard) */}
          <div id="dashboard" className="scroll-mt-24">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard title="Total Tiket" value={stats.total} color="blue" icon={Building2} />
              <StatsCard title="High Priority" value={stats.high} color="red" icon={AlertTriangle} />
              <StatsCard title="Medium Priority" value={stats.medium} color="yellow" icon={Map} />
              <StatsCard title="Low Priority" value={stats.low} color="green" icon={CheckCircle2} />
            </div>
          </div>

          {/* SECTION 2: MAP & CHART (ID: map-section) */}
          <div id="map-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-24">
            
            {/* PETA (2 Kolom) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2">
                   <Map className="text-blue-600" size={20}/> Peta Sebaran GPS
                 </h3>
                 <span className="text-xs bg-white px-2 py-1 rounded border shadow-sm text-slate-500">
                   Zona: {selectedZone}
                 </span>
               </div>
               <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 h-[500px] relative overflow-hidden group">
                  <MapComponent data={displayData} />
                  {/* Overlay Helper */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow border text-xs text-slate-600 z-[400]">
                    <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Priority</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Low</div>
                  </div>
               </div>
            </div>

            {/* CHART (1 Kolom) */}
            <div className="flex flex-col gap-4">
               <h3 className="font-bold text-slate-700">Analisis Biaya (K-Means)</h3>
               <div className="h-64">
                  <ClusterChart data={displayData} />
               </div>
               
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Table size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800">Laporan Maintenance</h4>
                    <p className="text-xs text-slate-500 mt-2 mb-6 px-4">
                      Download data lengkap dalam format CSV untuk laporan bulanan.
                    </p>
                    <button className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition shadow-lg shadow-slate-900/20">
                      Download CSV
                    </button>
                  </div>
               </div>
            </div>
          </div>

          {/* SECTION 3: TABEL (ID: table-section) */}
          <div id="table-section" className="scroll-mt-24">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-700">Detail Operasional Toko</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Menampilkan {displayData.length} data terpilih</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white border rounded text-xs font-mono text-slate-600 shadow-sm">
                    Total Cost: Rp {(stats.total > 0 ? displayData.reduce((a, b) => a + b.total_cost, 0) : 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4 tracking-wide">Nama Toko</th>
                      <th className="p-4 tracking-wide">Zona</th>
                      <th className="p-4 tracking-wide text-center">Freq</th>
                      <th className="p-4 tracking-wide text-right">Total Biaya</th>
                      <th className="p-4 tracking-wide text-center">Prioritas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayData.map((store, i) => {
                      let badgeClass = "bg-green-100 text-green-700 border-green-200";
                      if (store.priority === 'High Priority') badgeClass = "bg-red-50 text-red-600 border-red-200 ring-1 ring-red-100";
                      if (store.priority === 'Medium Priority') badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200";

                      return (
                        <tr key={i} className="hover:bg-blue-50/50 transition duration-150 group">
                          <td className="p-4 font-bold text-slate-700 group-hover:text-blue-700">{store['NAMA TOKO']}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-[11px] rounded-md font-medium text-slate-600 border border-slate-200 group-hover:bg-white group-hover:border-blue-200">{store.zone}</span>
                          </td>
                          <td className="p-4 text-center font-mono text-slate-600">{store.frequency}</td>
                          <td className="p-4 text-right font-mono font-medium text-slate-700">
                            Rp {store.total_cost.toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm inline-block min-w-[100px] ${badgeClass}`}>
                              {store.priority}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
