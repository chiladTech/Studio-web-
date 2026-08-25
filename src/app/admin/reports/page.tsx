'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  BarChart3, TrendingUp, Download, RefreshCw, CheckCircle2, DollarSign, Calendar, Users, Award, ChevronRight, Inbox, PieChart, ArrowUpRight
} from 'lucide-react';

export default function AdminReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (!res.ok) { router.push('/admin/login'); return; }
        const data = await res.json();
        setUser(data.user);

        await loadReports();
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const loadReports = async () => {
    try {
      const res = await fetch('/api/v1/reports');
      if (res.ok) {
        const data = await res.json();
        setReportData(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const inqRes = await fetch('/api/v1/inquiries');
      if (!inqRes.ok) throw new Error('Failed to fetch data for export');
      const inqJson = await inqRes.ok ? await inqRes.json() : { data: [] };
      const records = inqJson.data || [];

      // Generate CSV content
      const headers = [
        'Inquiry Number',
        'Date Received',
        'Client Full Name',
        'Email',
        'Phone',
        'Preferred Contact',
        'Service Requested',
        'Package',
        'Preferred Date',
        'Location',
        'Budget',
        'Status',
      ];

      const csvRows = [
        headers.join(','),
        ...records.map((r: any) => [
          `"${r.inquiryNumber || ''}"`,
          `"${new Date(r.createdAt).toLocaleDateString()}"`,
          `"${(r.fullName || '').replace(/"/g, '""')}"`,
          `"${r.email || ''}"`,
          `"${r.phone || ''}"`,
          `"${r.contactMethod || ''}"`,
          `"${(r.service || '').replace(/"/g, '""')}"`,
          `"${(r.package || '').replace(/"/g, '""')}"`,
          `"${(r.preferredDate || '').replace(/"/g, '""')}"`,
          `"${(r.location || '').replace(/"/g, '""')}"`,
          `"${(r.budget || '').replace(/"/g, '""')}"`,
          `"${r.status || 'NEW'}"`,
        ].join(',')),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Maya_Pictures_Inquiries_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error downloading CSV export.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">
        Loading Reports...
      </div>
    );
  }

  const summary = reportData?.summary || {
    totalInquiries: 0,
    newInquiries: 0,
    confirmedBookings: 0,
    completedSessions: 0,
    conversionRate: 0,
    estimatedPipelineETB: 0,
  };

  const statusCounts = reportData?.statusCounts || {};
  const serviceBreakdown = reportData?.serviceBreakdown || [];
  const packageBreakdown = reportData?.packageBreakdown || [];
  const monthlyTrends = reportData?.monthlyTrends || [];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header & Export */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#6a1b2a]" />
                Studio Analytics, Revenue & Performance Reports
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Real-time booking conversion metrics, service demand trends, and revenue pipeline analytics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadReports}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exporting ? 'Exporting...' : 'Export to CSV / Excel'}</span>
              </button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#6a1b2a] flex items-center justify-center font-bold text-xl shrink-0">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Inquiries</p>
                <h3 className="text-2xl font-extrabold text-neutral-900 mt-0.5">{summary.totalInquiries}</h3>
                <span className="text-[10px] text-amber-700 font-semibold">{summary.newInquiries} New pending</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Confirmed Bookings</p>
                <h3 className="text-2xl font-extrabold text-neutral-900 mt-0.5">{summary.confirmedBookings + summary.completedSessions}</h3>
                <span className="text-[10px] text-emerald-700 font-semibold">{summary.completedSessions} sessions completed</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xl shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Conversion Rate</p>
                <h3 className="text-2xl font-extrabold text-neutral-900 mt-0.5">{summary.conversionRate}%</h3>
                <span className="text-[10px] text-purple-700 font-semibold">Lead to booking ratio</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Pipeline Volume (ETB)</p>
                <h3 className="text-xl font-extrabold text-neutral-900 mt-0.5">
                  {summary.estimatedPipelineETB.toLocaleString()} ETB
                </h3>
                <span className="text-[10px] text-blue-700 font-semibold">Active & confirmed deals</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* SERVICE DEMAND BREAKDOWN */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#6a1b2a]" />
                  Service Popularity & Demand
                </h2>
                <span className="text-xs text-neutral-400 font-mono">By Inquiries</span>
              </div>

              {serviceBreakdown.length === 0 ? (
                <p className="text-xs text-neutral-400 py-8 text-center">No service inquiries logged yet.</p>
              ) : (
                <div className="space-y-4">
                  {serviceBreakdown.map((item: any) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800">{item.name}</span>
                        <span className="font-mono text-neutral-500">
                          {item.count} leads ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#6a1b2a] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(item.percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MONTHLY TIMELINE TRENDS */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6a1b2a]" />
                  6-Month Inquiries & Bookings Trend
                </h2>
                <span className="text-xs text-neutral-400 font-mono">Volume</span>
              </div>

              {monthlyTrends.length === 0 ? (
                <p className="text-xs text-neutral-400 py-8 text-center">No monthly trend data available.</p>
              ) : (
                <div className="grid grid-cols-6 gap-2 pt-4 items-end h-48">
                  {monthlyTrends.map((m: any) => {
                    const maxCount = Math.max(...monthlyTrends.map((t: any) => t.count), 1);
                    const heightPct = Math.max(Math.round((m.count / maxCount) * 100), 12);
                    return (
                      <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-[11px] font-bold text-[#6a1b2a] font-mono">{m.count}</span>
                        <div
                          className="w-full max-w-[36px] bg-[#6a1b2a]/20 hover:bg-[#6a1b2a] rounded-t-lg transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[10px] text-neutral-500 font-semibold text-center truncate w-full">
                          {m.month.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* STATUS PIPELINE BREAKDOWN */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-8">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6a1b2a]" />
              Inquiry Pipeline & Status Distribution
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'New / Inbox', count: statusCounts.NEW || 0, bg: 'bg-amber-50', text: 'text-amber-800' },
                { label: 'Contacted', count: statusCounts.CONTACTED || 0, bg: 'bg-blue-50', text: 'text-blue-800' },
                { label: 'Quoted', count: statusCounts.QUOTED || 0, bg: 'bg-orange-50', text: 'text-orange-800' },
                { label: 'Confirmed', count: statusCounts.CONFIRMED || 0, bg: 'bg-emerald-50', text: 'text-emerald-800' },
                { label: 'Completed', count: statusCounts.COMPLETED || 0, bg: 'bg-neutral-100', text: 'text-neutral-800' },
                { label: 'Cancelled', count: statusCounts.CANCELLED || 0, bg: 'bg-red-50', text: 'text-red-800' },
              ].map((s) => (
                <div key={s.label} className={`p-4 rounded-xl border border-neutral-200/80 ${s.bg} text-center`}>
                  <div className={`text-2xl font-black ${s.text}`}>{s.count}</div>
                  <div className="text-[11px] font-semibold text-neutral-600 mt-1 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
