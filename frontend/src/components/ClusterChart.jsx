import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

// Mendaftarkan komponen Chart.js agar bisa merender Scatter Plot
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const ClusterChart = ({ data }) => {
  // 1. Memisahkan data berdasarkan Cluster untuk pewarnaan titik
  const high = data.filter(d => d.priority === 'High Priority').map(d => ({ x: d.frequency, y: d.total_cost }));
  const medium = data.filter(d => d.priority === 'Medium Priority').map(d => ({ x: d.frequency, y: d.total_cost }));
  const low = data.filter(d => d.priority === 'Low Priority').map(d => ({ x: d.frequency, y: d.total_cost }));

  // 2. Konfigurasi Data Chart
  const chartData = {
    datasets: [
      {
        label: 'High Priority',
        data: high,
        backgroundColor: 'rgba(239, 68, 68, 1)', // Merah
        pointRadius: 6,
        hoverRadius: 8,
      },
      {
        label: 'Medium Priority',
        data: medium,
        backgroundColor: 'rgba(234, 179, 8, 1)', // Kuning
        pointRadius: 6,
        hoverRadius: 8,
      },
      {
        label: 'Low Priority',
        data: low,
        backgroundColor: 'rgba(34, 197, 94, 1)', // Hijau
        pointRadius: 6,
        hoverRadius: 8,
      },
    ],
  };

  // 3. Konfigurasi Tampilan (Sumbu X dan Y)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            // Menampilkan info detail saat mouse hover di titik
            const value = context.raw;
            return `Freq: ${value.x}x | Biaya: Rp ${value.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Frekuensi Kerusakan (Kali)' },
        beginAtZero: true,
        grid: { display: false }
      },
      y: {
        title: { display: true, text: 'Total Biaya (Rupiah)' },
        beginAtZero: true,
        border: { dash: [4, 4] }, // Garis putus-putus
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border h-full flex flex-col">
      <h3 className="font-bold text-gray-700 mb-2 text-sm">📈 Analisis Cluster (K-Means)</h3>
      <div className="flex-1 min-h-[250px]">
        <Scatter options={options} data={chartData} />
      </div>
    </div>
  );
};

export default ClusterChart;