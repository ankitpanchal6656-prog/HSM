'use client';

import { useState, useEffect } from 'react';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [form, setForm] = useState({ CustomerID: '', RoomID: '', CheckInDate: '', CheckOutDate: '', EstimatedCost: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, custRes, roomRes] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/customers'),
        fetch('/api/rooms')
      ]);
      const resJson = await resRes.json();
      const custJson = await custRes.json();
      const roomJson = await roomRes.json();
      
      if (resJson.success) setReservations(resJson.data);
      if (custJson.success) {
        setCustomers(custJson.data);
        if (custJson.data.length > 0) setForm(prev => ({...prev, CustomerID: custJson.data[0].CustomerID }));
      }
      if (roomJson.success) {
        setRooms(roomJson.data);
        if (roomJson.data.length > 0) setForm(prev => ({...prev, RoomID: roomJson.data[0].RoomID }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData() }, []);

  // Sync cost dynamically
  useEffect(() => {
    if (form.RoomID && form.CheckInDate && form.CheckOutDate) {
      const room = rooms.find(r => r.RoomID === Number(form.RoomID));
      if (room) {
        const d1 = new Date(form.CheckInDate);
        const d2 = new Date(form.CheckOutDate);
        if (d2 > d1) {
          const nights = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
          setForm(prev => ({ ...prev, EstimatedCost: nights * room.PricePerNight }));
        }
      }
    }
  }, [form.RoomID, form.CheckInDate, form.CheckOutDate, rooms]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMessage('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage('Reservation Confirmed!');
      fetchData(); // reload
    } catch (err) {
      setMessage(`Failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <div className="bg-surface-card rounded-card shadow-soft p-8 border border-black/5">
        <h3 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-serif)' }}>New Reservation</h3>
        <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-foreground-muted mb-2">Guest</label>
            <select required value={form.CustomerID} onChange={e => setForm({...form, CustomerID: e.target.value})} className="w-full px-4 py-3 bg-surface-soft rounded-xl outline-none border border-transparent focus:bg-white focus:border-primary/30">
              {customers.map(c => <option key={c.CustomerID} value={c.CustomerID}>{c.FullName}</option>)}
            </select>
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-foreground-muted mb-2">Room</label>
            <select required value={form.RoomID} onChange={e => setForm({...form, RoomID: e.target.value})} className="w-full px-4 py-3 bg-surface-soft rounded-xl outline-none border border-transparent focus:bg-white focus:border-primary/30">
              {rooms.map(r => <option key={r.RoomID} value={r.RoomID}>{r.RoomNumber} ({r.RoomType})</option>)}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold text-foreground-muted mb-2">Check-in</label>
            <input required type="date" value={form.CheckInDate} onChange={e => setForm({...form, CheckInDate: e.target.value})} className="w-full px-4 py-3 bg-surface-soft rounded-xl outline-none border border-transparent focus:bg-white focus:border-primary/30" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold text-foreground-muted mb-2">Check-out</label>
            <input required type="date" value={form.CheckOutDate} onChange={e => setForm({...form, CheckOutDate: e.target.value})} className="w-full px-4 py-3 bg-surface-soft rounded-xl outline-none border border-transparent focus:bg-white focus:border-primary/30" />
          </div>

          <div className="col-span-1 flex flex-col justify-end">
            <button disabled={submitting} type="submit" className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-button shadow-[0_8px_15px_rgba(255,92,0,0.2)] transition hover:-translate-y-0.5">
              {submitting ? 'Checking...' : 'Confirm Book: ₹' + form.EstimatedCost}
            </button>
          </div>
        </form>
        {message && <p className={`mt-4 text-sm font-bold ${message.includes('Failed') ? 'text-red-500' : 'text-emerald-600'}`}>{message}</p>}
      </div>

      <div className="bg-surface-card rounded-card shadow-soft p-8 border border-black/5">
        <h3 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Active Reservations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 text-sm uppercase text-foreground-muted">
                <th className="py-3 px-2 font-semibold">Res #</th>
                <th className="py-3 px-2 font-semibold">Guest</th>
                <th className="py-3 px-2 font-semibold">Room</th>
                <th className="py-3 px-2 font-semibold">Dates</th>
                <th className="py-3 px-2 font-semibold">Est. Cost</th>
                <th className="py-3 px-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" className="py-6 text-center text-slate-500">Loading...</td></tr> 
              : reservations.map(r => (
                <tr key={r.ReservationID} className="border-b border-black/5 hover:bg-surface-soft/50 group transition">
                  <td className="py-4 px-2 font-bold text-primary">#{r.ReservationID}</td>
                  <td className="py-4 px-2 font-medium">{r.FullName}</td>
                  <td className="py-4 px-2 font-serif text-lg">{r.RoomNumber}</td>
                  <td className="py-4 px-2 text-sm text-slate-600">
                    {new Date(r.CheckInDate).toLocaleDateString()} → {new Date(r.CheckOutDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-2 font-bold">₹{r.EstimatedCost}</td>
                  <td className="py-4 px-2 text-xs font-bold uppercase tracking-wide">
                    <span className={`px-3 py-1 rounded-full ${getStatusBadge(r.Status)}`}>{r.Status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
