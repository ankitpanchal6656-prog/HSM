'use client';

import { useState, useEffect } from 'react';

export default function BillingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBilling() }, []);

  const handleAction = async (action, resID) => {
    setProcessing(resID);
    try {
      let payload = { action, ReservationID: resID };
      if (action === 'checkout') {
        const added = prompt('Any extra minibar/service charges? (₹)', '0');
        if (added === null) return; // cancelled
        payload.AddedCharges = parseFloat(added);
        payload.PaymentMethod = confirm('Paid via Credit Card? (Cancel for Cash)') ? 'Card' : 'Cash';
      }

      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetchBilling();
    } catch (e) {
      alert('Error processing transaction');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <div className="bg-surface-card rounded-card shadow-soft p-8 border border-black/5">
        <h3 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Front Desk: Check-In & Billing</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 text-sm uppercase text-foreground-muted">
                <th className="py-3 px-2 font-semibold">Res #</th>
                <th className="py-3 px-2 font-semibold">Guest</th>
                <th className="py-3 px-2 font-semibold">Room</th>
                <th className="py-3 px-2 font-semibold">Status</th>
                <th className="py-3 px-2 font-semibold">Cost</th>
                <th className="py-3 px-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" className="py-6 text-center text-slate-500">Loading Front Desk...</td></tr> 
              : data.map(r => (
                <tr key={r.ReservationID} className="border-b border-black/5 hover:bg-surface-soft/50 group transition">
                  <td className="py-5 px-2 font-bold text-primary">#{r.ReservationID}</td>
                  <td className="py-5 px-2 font-bold text-foreground">{r.FullName}</td>
                  <td className="py-5 px-2 font-serif text-lg">{r.RoomNumber}</td>
                  <td className="py-5 px-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${r.Status === 'Confirmed' ? 'bg-indigo-100 text-indigo-700' : ''}
                      ${r.Status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${r.Status === 'Cancelled' ? 'bg-slate-100 text-slate-500' : ''}
                    `}>
                      {r.Status}
                    </span>
                  </td>
                  <td className="py-5 px-2 font-bold text-lg">₹{r.EstimatedCost}</td>
                  <td className="py-5 px-2 text-right space-x-2">
                    {r.Status === 'Confirmed' && !r.ActualCheckIn && (
                      <button 
                        onClick={() => handleAction('checkin', r.ReservationID)}
                        disabled={processing === r.ReservationID}
                        className="px-5 py-2 bg-foreground hover:bg-black text-white font-bold rounded-button shadow-md transition hover:-translate-y-0.5"
                      >
                        Check-In
                      </button>
                    )}
                    {r.Status === 'Confirmed' && r.ActualCheckIn && (
                      <button 
                        onClick={() => handleAction('checkout', r.ReservationID)}
                        disabled={processing === r.ReservationID}
                        className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-button shadow-md transition hover:-translate-y-0.5"
                      >
                        Check-Out & Bill
                      </button>
                    )}
                    {r.Status === 'Completed' && (
                      <button className="px-5 py-2 border border-black/10 text-foreground font-bold rounded-button hover:bg-surface-soft transition">
                        ✓ Paid: {r.PaymentStatus}
                      </button>
                    )}
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
