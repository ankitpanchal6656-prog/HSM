'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('hms_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Blurred background orbs mimicking fin-tech style */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-400/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-10 mx-4 glass-panel rounded-card shadow-soft">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            HMS System
          </h1>
          <p className="text-sm font-medium text-foreground-muted">Secure Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Username</label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 bg-surface-soft border border-black/5 rounded-2xl outline-none focus:bg-white focus:border-primary/50 transition-all text-foreground"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-5 py-3.5 bg-surface-soft border border-black/5 rounded-2xl outline-none focus:bg-white focus:border-primary/50 transition-all text-foreground"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 px-6 font-bold text-white bg-primary hover:bg-primary-dark rounded-button shadow-lg shadow-primary/20 transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-black/5 pt-6">
          <p className="text-xs font-medium text-foreground-muted">Demo Credentials: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
