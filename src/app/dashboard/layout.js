'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('hms_user');
    if (!storedUser) {
      router.push('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  if (!user) return <div className="min-h-screen bg-background flex items-center justify-center font-medium">Loading...</div>;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Customers', path: '/dashboard/customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Rooms', path: '/dashboard/rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Reservations', path: '/dashboard/reservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Billing', path: '/dashboard/billing', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z' },
  ];

  return (
    <div className="flex relative h-screen bg-background overflow-hidden font-sans">
      
      {/* Background glowing orb */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      {/* Sidebar navigation */}
      <aside className="relative z-10 w-64 flex-shrink-0 bg-surface-card border-r border-black/5 flex flex-col shadow-[2px_0_15px_rgba(0,0,0,0.02)]">
        <div className="h-20 flex items-center px-8">
          <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
            HMS.Pro
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link key={item.name} href={item.path}
                className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-primary text-white shadow-[0_8px_16px_rgba(255,92,0,0.2)]' : 'text-foreground-muted hover:bg-surface-soft hover:text-foreground'
                }`}
              >
                <svg className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-foreground-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={item.icon} />
                </svg>
                <span className="font-semibold text-[15px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Card */}
        <div className="p-4 border-t border-black/5 my-4 mx-4 bg-surface-soft rounded-3xl">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-white font-bold text-sm">
              {user.FullName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{user.FullName}</p>
              <p className="text-xs font-medium text-foreground-muted">{user.Role}</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('hms_user'); router.push('/'); }}
            className="w-full flex items-center justify-center px-4 py-2 bg-white border border-black/5 rounded-full text-sm font-semibold text-foreground hover:-translate-y-0.5 hover:shadow-soft transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="relative z-10 flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="h-20 flex items-center px-10">
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
            {navItems.find(i => pathname === i.path || pathname.startsWith(i.path + '/'))?.name || 'Overview'}
          </h2>
        </div>

        <div className="flex-1 p-10 pt-4">
          {children}
        </div>
      </main>

    </div>
  );
}
