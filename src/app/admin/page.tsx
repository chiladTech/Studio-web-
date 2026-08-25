'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Images, Inbox, Camera, Tags, BookOpen, MessageSquareQuote, LayoutDashboard,
  TrendingUp, Clock, PlusCircle, Film, Upload, Plus
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (!res.ok) {
          window.location.href = '/admin/login';
          return;
        }
        const data = await res.json();
        setUser(data.user);

        const inqRes = await fetch('/api/v1/inquiries');
        if (inqRes.ok) {
          const inqData = await inqRes.json();
          setInquiries(inqData.data || []);
        }
        setLoading(false);
      } catch (err) {
        window.location.href = '/admin/login';
      }
    }
    init();
  }, []);

  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'CONFIRMED', 'COMPLETED'];
  const getCount = (status: string) => inquiries.filter((i) => i.status === status).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400 text-sm">Loading Maya Pictures CMS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={user} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">
              Welcome, <span className="text-[#6a1b2a]">{user?.fullName?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Maya Pictures Studio CMS · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Total Inquiries', value: inquiries.length, icon: Inbox, color: 'text-[#6a1b2a]', bg: 'bg-[#f4e8ea]' },
              { label: 'New Inquiries', value: getCount('NEW'), icon: TrendingUp, color: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Confirmed Bookings', value: getCount('CONFIRMED'), icon: Camera, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Completed Sessions', value: getCount('COMPLETED'), icon: Images, color: 'text-blue-700', bg: 'bg-blue-50' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                    <div className="text-xs text-neutral-500 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inquiry Pipeline Status Row */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-600 mb-5 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#6a1b2a]" />
              Inquiry Pipeline
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {statuses.map((status) => {
                const count = getCount(status);
                const colors: Record<string, string> = {
                  NEW: 'bg-amber-500',
                  CONTACTED: 'bg-blue-500',
                  QUALIFIED: 'bg-purple-500',
                  QUOTED: 'bg-orange-500',
                  CONFIRMED: 'bg-green-500',
                  COMPLETED: 'bg-neutral-500',
                };
                return (
                  <div key={status} className="text-center">
                    <div className={`text-2xl font-bold text-white w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 ${colors[status]}`}>
                      {count}
                    </div>
                    <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">{status}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions + Recent Inquiries Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-600 mb-5 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#6a1b2a]" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'New Project', href: '/admin/portfolio', icon: Plus },
                  { label: 'View Inquiries', href: '/admin/inquiries', icon: Inbox },
                  { label: 'Upload Media', href: '/admin/media', icon: Upload },
                  { label: 'Edit Homepage', href: '/admin/homepage', icon: LayoutDashboard },
                  { label: 'New Package', href: '/admin/packages', icon: Tags },
                  { label: 'New Story', href: '/admin/stories', icon: BookOpen },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 px-4 py-3 bg-neutral-50 hover:bg-[#f4e8ea] hover:text-[#6a1b2a] border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 transition-all"
                    >
                      <Icon className="w-4 h-4 text-[#6a1b2a]" />
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6a1b2a]" />
                  Recent Inquiries
                </h2>
                <Link href="/admin/inquiries" className="text-xs font-semibold text-[#6a1b2a] hover:underline">
                  VIEW ALL →
                </Link>
              </div>
              <div className="space-y-3">
                {inquiries.slice(0, 5).map((inq) => (
                  <div
                    key={inq.id}
                    className="flex items-center justify-between py-2.5 border-b border-neutral-100 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-semibold text-neutral-800">{inq.fullName}</div>
                      <div className="text-xs text-neutral-500">{inq.service || 'Photography Session'}</div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      inq.status === 'NEW' ? 'bg-amber-100 text-amber-700' :
                      inq.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                ))}
                {inquiries.length === 0 && (
                  <p className="text-sm text-neutral-400 py-4 text-center">No inquiries yet. They will appear here when clients submit booking requests.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
