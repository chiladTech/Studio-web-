'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Users, UserPlus, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    roleName: 'CONTENT_ADMINISTRATOR',
  });

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      setUser(data.user);
      await loadUsers();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadUsers = async () => {
    const res = await fetch('/api/v1/users');
    if (res.ok) {
      const data = await res.json();
      setUsersList(data.data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Administrator created successfully!');
        setFormData({ fullName: '', email: '', username: '', password: '', roleName: 'CONTENT_ADMINISTRATOR' });
        setShowModal(false);
        await loadUsers();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error || 'Failed to create user'}`);
      }
    } catch (e) {
      setMessage('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6a1b2a]" />
                CMS Users & Permissions
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Manage team members with access to Maya Pictures CMS</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Administrator</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 font-bold text-neutral-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#f4e8ea] text-[#6a1b2a] font-bold flex items-center justify-center text-xs">
                        {u.fullName?.charAt(0)}
                      </div>
                      {u.fullName}
                    </td>
                    <td className="p-4 text-neutral-600">{u.email}</td>
                    <td className="p-4 font-mono text-neutral-500">{u.username}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${u.role === 'SYSTEM_ADMINISTRATOR' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        <ShieldCheck className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Create Admin User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Solomon Tadesse"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="solomon@mayapictures.com"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="solomon"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Role</label>
                    <select
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a] bg-white"
                    >
                      <option value="CONTENT_ADMINISTRATOR">Content Administrator</option>
                      <option value="SYSTEM_ADMINISTRATOR">System Administrator</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-xs font-semibold bg-[#6a1b2a] text-white rounded-xl hover:bg-[#8f2a3e] disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
