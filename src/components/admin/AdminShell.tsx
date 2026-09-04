'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

/**
 * Admin application shell.
 *
 * Owns the single authenticated-user lookup and renders three clearly
 * independent regions:
 *   - <AdminHeader />  — sticky top bar (menu toggle on mobile)
 *   - <AdminSidebar /> — fixed-width navigation, static on desktop,
 *                        drawer on mobile
 *   - main region      — scrolls independently on desktop while the
 *                        sidebar stays in place
 *
 * Every admin page under /admin/(dashboard) renders its own <main>
 * content inside this shell via the route-group layout.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (!res.ok) {
          if (!cancelled) router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setUser(data.user);
          setLoading(false);
        }
      } catch (err) {
        console.error('Admin auth check failed:', err);
        if (!cancelled) router.replace('/admin/login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading Maya Pictures CMS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:h-screen">
      {/* Independent region 1: header (sticky) */}
      <AdminHeader user={user} onMenuClick={() => setMobileNavOpen(true)} />

      {/* Regions 2 + 3: sidebar and independently scrollable main content */}
      <div className="flex flex-1 min-h-0">
        <AdminSidebar user={user} mobileOpen={mobileNavOpen} onClose={closeMobileNav} />
        <div className="flex-1 min-w-0 min-h-0 lg:overflow-y-auto flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}