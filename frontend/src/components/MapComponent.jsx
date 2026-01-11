import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ data }) => {
  // Pusat Peta (Bandung)
  const center = [-6.9175, 107.6191];

  const getColor = (priority) => {
    if (priority === 'High Priority') return '#ef4444'; // Merah
    if (priority === 'Medium Priority') return '#eab308'; // Kuning
    return '#22c55e'; // Hijau
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border h-[400px]">
      <h3 className="font-bold text-gray-700 mb-4">📍 Peta Sebaran Maintenance</h3>
      <MapContainer center={center} zoom={10} scrollWheelZoom={false} style={{ height: '90%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((store, idx) => (
          <CircleMarker
            key={idx}
            center={[store.lat, store.lng]}
            pathOptions={{ color: getColor(store.priority), fillColor: getColor(store.priority), fillOpacity: 0.7 }}
            radius={8}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-base">{store['NAMA TOKO']}</strong>
                <p className="text-gray-500 text-xs mb-2">{store.zone}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span>Freq: <b>{store.frequency}x</b></span>
                  <span>Biaya: <b>{store.total_cost.toLocaleString()}</b></span>
                </div>
                <div className={`mt-2 font-bold text-center py-1 rounded text-white text-xs`} 
                     style={{backgroundColor: getColor(store.priority)}}>
                  {store.priority}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;