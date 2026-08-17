'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Inbox, Search, RefreshCw, ChevronDown } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-amber-100 text-amber-800',
  CONTACTED: 'bg-blue-100 text-blue-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  QUOTED: 'bg-orange-100 text-orange-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-neutral-200 text-neutral-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-gray-100 text-gray-500',
};

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      setUser(data.user);
      await loadInquiries();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadInquiries = async () => {
    const res = await fetch('/api/v1/inquiries');
    if (res.ok) {
      const data = await res.json();
      setInquiries(data.data || []);
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    setUpdatingStatus(true);
    const res = await fetch(`/api/v1/inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      await loadInquiries();
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
    setUpdatingStatus(false);
  };

  const filtered = inquiries.filter((inq) => {
    const matchSearch = searchTerm === '' ||
      inq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.inquiryNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || inq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#6a1b2a]" />
                Inquiries & Bookings
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">{filtered.length} total entries</p>
            </div>
            <button onClick={loadInquiries} className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-[#6a1b2a] border border-neutral-200 bg-white px-3 py-2 rounded-xl transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white outline-none focus:border-[#6a1b2a] min-w-[240px]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white outline-none focus:border-[#6a1b2a]"
            >
              <option value="ALL">All Statuses</option>
              {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inquiry List */}
            <div className="lg:col-span-1 space-y-3">
              {filtered.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center border border-neutral-200 text-sm text-neutral-400">
                  No inquiries found
                </div>
              )}
              {filtered.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`bg-white rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md ${selectedInquiry?.id === inq.id ? 'border-[#6a1b2a] ring-2 ring-[#6a1b2a]/10' : 'border-neutral-200'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-sm text-neutral-900">{inq.fullName}</div>
                      <div className="text-xs text-neutral-500">{inq.inquiryNumber}</div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[inq.status] || 'bg-gray-100 text-gray-500'}`}>
                      {inq.status}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600">{inq.service || '—'} · {inq.package || '—'}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Inquiry Detail */}
            <div className="lg:col-span-2">
              {!selectedInquiry ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
                  Select an inquiry on the left to view its full details.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">{selectedInquiry.fullName}</h2>
                      <div className="text-xs text-neutral-500 font-mono">{selectedInquiry.inquiryNumber}</div>
                    </div>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                      disabled={updatingStatus}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[selectedInquiry.status]}`}
                    >
                      {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-xs text-neutral-400 uppercase font-semibold">Email</span><p className="text-neutral-800 mt-0.5">{selectedInquiry.email}</p></div>
                    <div><span className="text-xs text-neutral-400 uppercase font-semibold">Phone</span><p className="text-neutral-800 mt-0.5">{selectedInquiry.phone}</p></div>
                    <div><span className="text-xs text-neutral-400 uppercase font-semibold">Service</span><p className="text-neutral-800 mt-0.5">{selectedInquiry.service || '—'}</p></div>
                    <div><span className="text-xs text-neutral-400 uppercase font-semibold">Package</span><p className="text-neutral-800 mt-0.5">{selectedInquiry.package || '—'}</p></div>
                    <div><span className="text-xs text-neutral-400 uppercase font-semibold">Preferred Date</span><p className="text-neutral-800 mt-0.5">{selectedInquiry.preferredDate || '—'}</p></div>
                    <div><span className="text-xs text-neutral-400 uppercase font-semibold">Location</span><p className="text-neutral-800 mt-0.5">{selectedInquiry.location || '—'}</p></div>
                    <div><span className="text-xs text-neutral-400 uppercase font-semibold">Budget</span><p className="text-neutral-800 mt-0.5">{selectedInquiry.budget || '—'}</p></div>
                    <div><span className="text-xs text-neutral-400 uppercase font-semibold">Contact Method</span><p className="text-neutral-800 mt-0.5">{selectedInquiry.contactMethod}</p></div>
                  </div>

                  <div>
                    <span className="text-xs text-neutral-400 uppercase font-semibold">Message</span>
                    <p className="text-sm text-neutral-800 mt-1 bg-neutral-50 p-4 rounded-xl leading-relaxed">{selectedInquiry.message}</p>
                  </div>

                  <div className="text-xs text-neutral-400 pt-3 border-t border-neutral-100">
                    Submitted: {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
