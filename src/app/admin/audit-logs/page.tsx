'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  History, Search, RefreshCw, Shield, User, Clock, CheckCircle2, AlertCircle, FileText, Settings, UserCheck
} from 'lucide-react';

interface AuditItem {
  id: string;
  action: string;
  resource: string;
  details: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
  } | null;
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (!res.ok) { router.push('/admin/login'); return; }
        const data = await res.json();
        setCurrentUser(data.user);

        await loadLogs();
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/v1/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      searchTerm === '' ||
      log.action.toLowerCase().includes(term) ||
      log.resource.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term)) ||
      (log.user && (log.user.fullName.toLowerCase().includes(term) || log.user.email.toLowerCase().includes(term)));

    const matchAction = actionFilter === 'ALL' || log.action.startsWith(actionFilter);
    return matchSearch && matchAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('UPDATE') || action.includes('EDIT')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (action.includes('DELETE') || action.includes('REMOVE')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">
        Loading Audit Logs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={currentUser} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <History className="w-5 h-5 text-[#6a1b2a]" />
                Administrator Activity & Security Audit Logs
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Chronological trail of administrative actions, user edits, pricing changes, and security updates
              </p>
            </div>

            <button
              onClick={loadLogs}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search audit log by admin name, action, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#6a1b2a]"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 outline-none focus:border-[#6a1b2a]"
            >
              <option value="ALL">All Actions</option>
              <option value="USER">User & Permissions</option>
              <option value="PACKAGE">Packages & Pricing</option>
              <option value="SERVICE">Services</option>
              <option value="INQUIRY">Inquiries</option>
              <option value="SETTINGS">Settings</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-neutral-900">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#f4e8ea] text-[#6a1b2a] font-bold flex items-center justify-center text-[10px] shrink-0">
                            {log.user.fullName?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div>{log.user.fullName}</div>
                            <span className="text-[10px] text-neutral-400 font-mono">@{log.user.username}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">System Auto</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-neutral-700">{log.resource}</td>
                    <td className="p-4 text-neutral-600 max-w-md break-words">{log.details || '—'}</td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                      No audit log activities matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
