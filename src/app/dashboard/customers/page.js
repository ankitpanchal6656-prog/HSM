'use client';

import { useState, useEffect } from 'react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ FullName: '', Phone: '', Email: '', IDProofType: 'Aadhaar', IDProofNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCustomers = async (s = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers${s ? `?search=${s}` : ''}`);
      const json = await res.json();
      if (json.success) setCustomers(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage('Customer registered successfully!');
      setForm({ FullName: '', Phone: '', Email: '', IDProofType: 'Aadhaar', IDProofNumber: '' });
      fetchCustomers();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Registration Form */}
        <div className="lg:col-span-1 bg-surface-card rounded-card shadow-soft p-8 border border-black/5">
          <h3 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Register Guest</h3>
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground-muted mb-1">Full Name</label>
              <input required type="text" value={form.FullName} onChange={e => setForm({...form, FullName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-surface-soft border border-transparent focus:border-primary/30 focus:bg-white outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground-muted mb-1">Phone</label>
              <input required type="text" value={form.Phone} onChange={e => setForm({...form, Phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-surface-soft border border-transparent focus:border-primary/30 focus:bg-white outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground-muted mb-1">Email</label>
              <input type="email" value={form.Email} onChange={e => setForm({...form, Email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-surface-soft border border-transparent focus:border-primary/30 focus:bg-white outline-none transition" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground-muted mb-1">ID Type</label>
                <select value={form.IDProofType} onChange={e => setForm({...form, IDProofType: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-surface-soft border border-transparent focus:border-primary/30 outline-none transition">
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="Passport">Passport</option>
                  <option value="DL">DL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground-muted mb-1">ID Number</label>
                <input required type="text" value={form.IDProofNumber} onChange={e => setForm({...form, IDProofNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-surface-soft border border-transparent focus:border-primary/30 focus:bg-white outline-none transition" />
              </div>
            </div>
            
            <button disabled={submitting} type="submit" className="w-full py-3.5 bg-foreground hover:bg-black text-white font-bold rounded-button shadow-lg mt-4 transition hover:-translate-y-0.5">
              {submitting ? 'Registering...' : 'Register Customer'}
            </button>
            {message && <p className="text-sm text-center font-medium mt-2 text-primary">{message}</p>}
          </form>
        </div>

        {/* DataGrid */}
        <div className="lg:col-span-2 bg-surface-card rounded-card shadow-soft p-8 border border-black/5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>Guest Directory</h3>
            <form onSubmit={handleSearch} className="flex">
              <input type="text" placeholder="Search by name, ID..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2.5 rounded-l-xl bg-surface-soft border-none outline-none focus:bg-white transition" />
              <button type="submit" className="px-4 py-2.5 bg-primary text-white font-bold rounded-r-xl">Search</button>
            </form>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-sm uppercase text-foreground-muted">
                  <th className="py-3 px-4 font-semibold hover:bg-surface-soft">ID</th>
                  <th className="py-3 px-4 font-semibold hover:bg-surface-soft">Name</th>
                  <th className="py-3 px-4 font-semibold hover:bg-surface-soft">Phone</th>
                  <th className="py-3 px-4 font-semibold hover:bg-surface-soft">ID Proof</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="py-8 text-center text-foreground-muted">Loading directory...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-foreground-muted">No guests found.</td></tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.CustomerID} className="border-b border-black/5 hover:bg-surface-soft/50 transition">
                      <td className="py-4 px-4 text-sm font-semibold text-primary">{c.CustomerID}</td>
                      <td className="py-4 px-4 font-medium">{c.FullName}</td>
                      <td className="py-4 px-4 text-foreground-muted">{c.Phone}</td>
                      <td className="py-4 px-4 text-sm"><span className="px-2 py-1 bg-white rounded-md border border-black/5 font-mono">{c.IDProofType}: {c.IDProofNumber}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
