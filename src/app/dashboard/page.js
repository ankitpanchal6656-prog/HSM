'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    todaysCheckins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Rooms', value: stats.totalRooms, icon: '🏠', border: 'border-l-4 border-l-black' },
    { title: 'Occupied', value: stats.occupiedRooms, icon: '🛏️', border: 'border-l-4 border-l-primary' },
    { title: 'Available', value: stats.availableRooms, icon: '🔑', border: 'border-l-4 border-l-emerald-500' },
    { title: "Today's Check-ins", value: stats.todaysCheckins, icon: '✈️', border: 'border-l-4 border-l-indigo-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            className={`relative overflow-hidden bg-surface-card rounded-card shadow-soft p-8 transition-transform duration-300 hover:-translate-y-1 ${card.border}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground-muted mb-2 uppercase tracking-wider">{card.title}</p>
                {loading ? (
                  <div className="h-10 w-16 bg-surface-soft rounded-lg animate-pulse" />
                ) : (
                  <h3 className="text-5xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                    {card.value}
                  </h3>
                )}
              </div>
              <div className="text-3xl opacity-80 bg-surface-soft p-3 rounded-full">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-10 rounded-card bg-surface-card shadow-soft border border-black/5">
        <h3 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Action Required</h3>
        <div className="flex gap-4">
          <button className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-button text-sm font-bold transition shadow-[0_10px_20px_rgba(255,92,0,0.2)] hover:-translate-y-0.5">
            + New Reservation
          </button>
          <button className="px-8 py-3.5 bg-surface-soft hover:bg-gray-200 text-foreground rounded-button text-sm font-bold transition">
            Register Check-In
          </button>
        </div>
      </div>

    </div>
  );
}
