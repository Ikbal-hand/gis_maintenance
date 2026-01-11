import React from 'react';

const StatsCard = ({ title, value, color, icon: Icon }) => {
  // Mapping warna sesuai prototype (Blue, Red, Yellow, Green)
  const colors = {
    blue: { border: 'border-blue-500', text: 'text-blue-600', bgIcon: 'bg-blue-100' },
    red: { border: 'border-red-500', text: 'text-red-600', bgIcon: 'bg-red-100' },
    yellow: { border: 'border-yellow-500', text: 'text-yellow-600', bgIcon: 'bg-yellow-100' },
    green: { border: 'border-green-500', text: 'text-green-600', bgIcon: 'bg-green-100' },
  };

  const theme = colors[color] || colors.blue;

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${theme.border} flex items-center justify-between`}>
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className={`text-2xl font-bold mt-1 ${theme.text}`}>{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${theme.bgIcon} ${theme.text}`}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default StatsCard;