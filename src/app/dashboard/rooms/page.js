'use client';

import { useState, useEffect } from 'react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  
  const [form, setForm] = useState({ RoomNumber: '', RoomType: 'Single', Floor: 1, PricePerNight: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms');
      const json = await res.json();
      if (json.success) setRooms(json.data);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => {
    const stored = localStorage.getItem('hms_user');
    if (stored) setUserRole(JSON.parse(stored).Role);
    fetchRooms();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMessage('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Room Added!');
      setForm({ RoomNumber: '', RoomType: 'Single', Floor: 1, PricePerNight: '' });
      fetchRooms();
    } catch (err) { setMessage(err.message); } 
    finally { setSubmitting(false); }
  };

  const updateStatus = async (roomID, newStatus) => {
    try {
      await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ RoomID: roomID, Status: newStatus })
      });
      fetchRooms(); // Refresh
    } catch (err) { alert('Failed to update status'); }
  };

  const getStatusColor = (status) => {
    if (status === 'Available') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Occupied') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-slate-200 text-slate-700 border-slate-300';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Create Room (Admin Only) */}
      {userRole === 'Admin' && (
        <div className="bg-surface-card rounded-card shadow-soft p-8 border border-black/5">
          <h3 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Add Inventory</h3>
          <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-foreground-muted mb-1">Room No</label>
              <input required type="text" value={form.RoomNumber} onChange={e => setForm({...form, RoomNumber: e.target.value})} className="w-full px-4 py-2 bg-surface-soft rounded-lg outline-none focus:bg-white" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-foreground-muted mb-1">Type</label>
              <select value={form.RoomType} onChange={e => setForm({...form, RoomType: e.target.value})} className="w-full px-4 py-2 bg-surface-soft rounded-lg outline-none">
                <option>Single</option><option>Double</option><option>Deluxe</option><option>Suite</option>
              </select>
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-semibold text-foreground-muted mb-1">Floor</label>
              <input required type="number" min="1" value={form.Floor} onChange={e => setForm({...form, Floor: e.target.value})} className="w-full px-4 py-2 bg-surface-soft rounded-lg outline-none focus:bg-white" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-semibold text-foreground-muted mb-1">Rate (₹)</label>
              <input required type="number" step="0.01" value={form.PricePerNight} onChange={e => setForm({...form, PricePerNight: e.target.value})} className="w-full px-4 py-2 bg-surface-soft rounded-lg outline-none focus:bg-white" />
            </div>
            <button disabled={submitting} type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:-translate-y-0.5 transition">
              {submitting ? '...' : '+ Add'}
            </button>
          </form>
          {message && <p className="text-primary text-sm mt-3 font-medium">{message}</p>}
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading ? <p>Loading inventory...</p> : rooms.map((room) => (
          <div key={room.RoomID} className="bg-surface-card border border-black/5 rounded-3xl p-6 shadow-soft hover:shadow-xl hover:-translate-y-1 transition duration-300">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-3xl font-bold font-serif">{room.RoomNumber}</h4>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(room.Status)}`}>
                {room.Status}
              </span>
            </div>
            <div className="space-y-1 mb-6">
              <p className="text-sm font-medium text-foreground-muted">{room.RoomType} • Floor {room.Floor}</p>
              <p className="text-sm font-bold text-foreground">₹{room.PricePerNight} <span className="text-xs text-foreground-muted font-normal">/night</span></p>
            </div>
            
            {/* Status Toggles */}
            <div className="flex bg-surface-soft rounded-full p-1 border border-black/5">
              <button 
                onClick={() => updateStatus(room.RoomID, 'Available')}
                className={`flex-1 text-xs py-1.5 rounded-full font-semibold transition ${room.Status === 'Available' ? 'bg-white shadow' : 'text-slate-500 hover:text-black'}`}
              >Avail</button>
              {userRole === 'Admin' && (
                <button 
                  onClick={() => updateStatus(room.RoomID, 'Maintenance')}
                  className={`flex-1 text-xs py-1.5 rounded-full font-semibold transition ${room.Status === 'Maintenance' ? 'bg-white shadow' : 'text-slate-500 hover:text-black'}`}
                >Maint</button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
