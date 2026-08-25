'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Users, UserPlus, CheckCircle, Loader2, ShieldCheck, Trash2, Sliders, CheckSquare, Square, Save, Eye, EyeOff, X, Lock, Check, Edit2, KeyRound
} from 'lucide-react';

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

const AVAILABLE_PAGES = [
  { href: '/admin', label: 'Dashboard Overview', category: 'Operations', desc: 'Main statistics and quick summaries' },
  { href: '/admin/inquiries', label: 'Inquiries & Bookings', category: 'Operations', desc: 'Customer booking requests & statuses' },
  { href: '/admin/reports', label: 'Reports & Analytics', category: 'Operations', desc: 'Visual analytics, revenue & CSV export' },
  { href: '/admin/portfolio', label: 'Portfolio Projects', category: 'Media & Portfolio', desc: 'Photo & video project galleries' },
  { href: '/admin/categories', label: 'Categories', category: 'Media & Portfolio', desc: 'Portfolio category tags' },
  { href: '/admin/media', label: 'Media Library', category: 'Media & Portfolio', desc: 'Uploaded high-res photos & videos' },
  { href: '/admin/services', label: 'Studio Services', category: 'Services & Pricing', desc: 'Service offerings & video reels' },
  { href: '/admin/packages', label: 'Packages (ETB)', category: 'Services & Pricing', desc: 'Pricing tiers and deliverables' },
  { href: '/admin/stories', label: 'Stories & Blog', category: 'Content Management', desc: 'Create, edit, and publish articles' },
  { href: '/admin/testimonials', label: 'Testimonials & Reviews', category: 'Content Management', desc: 'Client reviews and ratings' },
  { href: '/admin/faq', label: 'FAQ Manager', category: 'Content Management', desc: 'Q&A accordion items' },
  { href: '/admin/homepage', label: 'Homepage & Hero', category: 'Settings', desc: 'Hero background video and headlines' },
  { href: '/admin/nav-footer', label: 'Nav & Footer Links', category: 'Settings', desc: 'Header & footer link items' },
  { href: '/admin/settings', label: 'Studio Global Settings', category: 'Settings', desc: 'Profile, contact info, socials' },
  { href: '/admin/users', label: 'Users & Roles', category: 'Settings', desc: 'Team accounts & permission management' },
  { href: '/admin/audit-logs', label: 'Activity Audit Logs', category: 'Settings', desc: 'Administrative action audit trail' },
];

const DEFAULT_CONTENT_PAGES = [
  '/admin',
  '/admin/stories',
  '/admin/testimonials',
  '/admin/faq',
  '/admin/portfolio',
  '/admin/categories',
  '/admin/media',
  '/admin/services',
  '/admin/packages',
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Edit User & Password Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    roleName: 'CONTENT_ADMINISTRATOR',
    password: '',
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Per-User Permissions Modal State
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<UserItem | null>(null);
  const [userAllowedPages, setUserAllowedPages] = useState<string[]>([]);
  const [loadingUserPerms, setLoadingUserPerms] = useState(false);
  const [savingUserPerms, setSavingUserPerms] = useState(false);

  // New User Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    roleName: 'CONTENT_ADMINISTRATOR',
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (!res.ok) { router.push('/admin/login'); return; }
        const data = await res.json();
        setCurrentUser(data.user);

        await loadUsers();
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/v1/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.data || []);
      }
    } catch {}
  };

  const handleOpenEditModal = (targetUser: UserItem) => {
    setEditingUser(targetUser);
    setEditFormData({
      fullName: targetUser.fullName,
      email: targetUser.email,
      username: targetUser.username,
      roleName: targetUser.role || 'CONTENT_ADMINISTRATOR',
      password: '',
    });
    setShowEditPassword(false);
    setErrorMessage('');
    setMessage('');
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    setErrorMessage('');
    setMessage('');

    try {
      const payload: any = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        username: editFormData.username,
        roleName: editFormData.roleName,
      };

      if (editFormData.password && editFormData.password.trim().length > 0) {
        payload.password = editFormData.password;
      }

      const res = await fetch(`/api/v1/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Administrator "${editFormData.fullName}" was updated successfully!${editFormData.password ? ' (Password changed)' : ''}`);
        setEditingUser(null);
        await loadUsers();
      } else {
        setErrorMessage(data.error || 'Failed to update user account');
      }
    } catch {
      setErrorMessage('Network error occurred while updating user');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenPermissionsModal = async (targetUser: UserItem) => {
    setSelectedUserForPerms(targetUser);
    setLoadingUserPerms(true);

    try {
      const res = await fetch(`/api/v1/users/${targetUser.id}/permissions`);
      if (res.ok) {
        const data = await res.json();
        setUserAllowedPages(data.allowedPages || DEFAULT_CONTENT_PAGES);
      } else {
        setUserAllowedPages(DEFAULT_CONTENT_PAGES);
      }
    } catch {
      setUserAllowedPages(DEFAULT_CONTENT_PAGES);
    } finally {
      setLoadingUserPerms(false);
    }
  };

  const handleTogglePageForUser = (href: string) => {
    setUserAllowedPages((prev) =>
      prev.includes(href) ? prev.filter((p) => p !== href) : [...prev, href]
    );
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUserForPerms) return;
    setSavingUserPerms(true);
    setMessage('');

    try {
      const res = await fetch(`/api/v1/users/${selectedUserForPerms.id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedPages: userAllowedPages }),
      });

      if (res.ok) {
        setMessage(`Sidebar permissions for "${selectedUserForPerms.fullName}" saved successfully!`);
        setSelectedUserForPerms(null);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to save permissions');
      }
    } catch {
      setErrorMessage('Network error occurred while saving user permissions.');
    } finally {
      setSavingUserPerms(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(`Administrator "${formData.fullName}" created successfully!`);
        setFormData({ fullName: '', email: '', username: '', password: '', roleName: 'CONTENT_ADMINISTRATOR' });
        setShowAddModal(false);
        await loadUsers();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to create user');
      }
    } catch (e) {
      setErrorMessage('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (targetUser: UserItem) => {
    if (targetUser.id === currentUser?.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }

    if (!confirm(`Are you sure you want to delete administrator "${targetUser.fullName}" (${targetUser.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/users/${targetUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage(`User "${targetUser.fullName}" has been deleted.`);
        await loadUsers();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to delete user');
      }
    } catch (e) {
      setErrorMessage('Network error occurred while deleting user.');
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>;

  const isSystemAdmin = currentUser?.roleName === 'SYSTEM_ADMINISTRATOR';

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={currentUser} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6a1b2a]" />
                User Management, Editing & Passwords
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Edit team details, change passwords, manage administrator roles, and configure individual sidebar access
              </p>
            </div>

            {isSystemAdmin && (
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setMessage('');
                  setErrorMessage('');
                }}
                className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Admin User</span>
              </button>
            )}
          </div>

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
              <button onClick={() => setMessage('')} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* USERS TABLE */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Date Joined</th>
                  {isSystemAdmin && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {usersList.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isTargetSystemAdmin = u.role === 'SYSTEM_ADMINISTRATOR';
                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/50">
                      <td className="p-4 font-bold text-neutral-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#f4e8ea] text-[#6a1b2a] font-bold flex items-center justify-center text-xs shrink-0">
                          {u.fullName?.charAt(0)}
                        </div>
                        <div>
                          <div>{u.fullName}</div>
                          {isSelf && (
                            <span className="text-[10px] text-[#6a1b2a] font-semibold tracking-wide">(You)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-neutral-600 font-mono">{u.email}</td>
                      <td className="p-4 font-mono text-neutral-500">@{u.username}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                          isTargetSystemAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {isTargetSystemAdmin ? 'System Administrator' : 'Content Administrator'}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      {isSystemAdmin && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit & Change Password Button */}
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-sm"
                              title="Edit User Details & Password"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#6a1b2a]" />
                              <span>Edit & Password</span>
                            </button>

                            {/* Individual Sidebar Permissions Button */}
                            {!isTargetSystemAdmin && (
                              <button
                                onClick={() => handleOpenPermissionsModal(u)}
                                className="inline-flex items-center gap-1.5 bg-[#f4e8ea] hover:bg-[#e6d4d6] text-[#6a1b2a] px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-sm"
                                title="Configure Custom Sidebar Pages"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Sidebar</span>
                              </button>
                            )}

                            {/* Delete User Button */}
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* EDIT USER & PASSWORD MODAL */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl my-6">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-[#6a1b2a]" />
                    <h2 className="text-base font-bold text-neutral-900">
                      {editingUser.id === currentUser?.id ? 'Edit Your Account & Password' : `Edit User: ${editingUser.fullName}`}
                    </h2>
                  </div>
                  <button onClick={() => setEditingUser(null)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm font-mono outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  {editingUser.id === currentUser?.id ? (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Role & Privilege Level</label>
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
                        <ShieldCheck className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                        <div>
                          <div>System Administrator</div>
                          <div className="text-[10px] text-amber-700 font-normal mt-0.5">
                            You cannot change your own privilege (prevents system lockout).
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Role & Privilege Level</label>
                      <select
                        value={editFormData.roleName}
                        onChange={(e) => setEditFormData({ ...editFormData, roleName: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a] bg-white font-semibold"
                      >
                        <option value="CONTENT_ADMINISTRATOR">Content Administrator (Custom Sidebar)</option>
                        <option value="SYSTEM_ADMINISTRATOR">System Administrator (Full Privileges)</option>
                      </select>
                    </div>
                  )}

                  {/* CHANGE PASSWORD FIELD */}
                  <div className="pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#6a1b2a]" />
                        <span>Change Password</span>
                      </label>
                      <span className="text-[11px] text-neutral-400">(Optional)</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-2">
                      Leave blank to keep current password, or type a new password to reset it.
                    </p>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                        placeholder="Type new password (min 6 chars)..."
                        className="w-full px-3 py-2 pr-10 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="px-5 py-2.5 text-xs font-semibold bg-[#6a1b2a] text-white rounded-xl hover:bg-[#8f2a3e] disabled:opacity-50 flex items-center gap-2 shadow"
                    >
                      {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PER-USER SIDEBAR PERMISSIONS MODAL */}
          {selectedUserForPerms && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-6">
                <div className="flex items-start justify-between mb-4 border-b border-neutral-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-[#6a1b2a]" />
                      Custom Sidebar Pages for {selectedUserForPerms.fullName}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                      {selectedUserForPerms.email} · @{selectedUserForPerms.username}
                    </p>
                  </div>
                  <button onClick={() => setSelectedUserForPerms(null)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loadingUserPerms ? (
                  <div className="py-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading permissions...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-neutral-600">
                        Check or uncheck pages visible in this user's sidebar:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setUserAllowedPages(AVAILABLE_PAGES.map((p) => p.href))}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold"
                        >
                          Check All
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserAllowedPages(['/admin'])}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold"
                        >
                          Clear All
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserAllowedPages(DEFAULT_CONTENT_PAGES)}
                          className="px-2.5 py-1 bg-[#f4e8ea] hover:bg-[#e6d4d6] text-[#6a1b2a] rounded-lg text-xs font-semibold"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1">
                      {AVAILABLE_PAGES.map((page) => {
                        const isEnabled = userAllowedPages.includes(page.href);
                        return (
                          <div
                            key={page.href}
                            onClick={() => handleTogglePageForUser(page.href)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                              isEnabled
                                ? 'bg-amber-50/50 border-[#6a1b2a]/30 shadow-sm'
                                : 'bg-neutral-50/50 border-neutral-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="mt-0.5 text-[#6a1b2a]">
                              {isEnabled ? (
                                <CheckSquare className="w-4 h-4 text-[#6a1b2a]" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs font-bold ${isEnabled ? 'text-neutral-900' : 'text-neutral-500'}`}>
                                  {page.label}
                                </span>
                                <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                                  {page.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{page.desc}</p>
                              <span className="text-[10px] font-mono text-neutral-400 mt-1 block">{page.href}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        <strong>{userAllowedPages.length}</strong> of {AVAILABLE_PAGES.length} pages enabled
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUserForPerms(null)}
                          className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveUserPermissions}
                          disabled={savingUserPerms}
                          className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                        >
                          {savingUserPerms ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>Save Permissions</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CREATE ADMIN USER MODAL */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h2 className="text-lg font-bold text-neutral-900">Create New CMS Administrator</h2>
                  <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Dawit Tadesse"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="dawit@mayapictures.com"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="dawit"
                      className="w-full px-3 py-2 border rounded-xl text-sm font-mono outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showCreatePassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                      >
                        {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Role & Privilege Level</label>
                    <select
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a] bg-white font-semibold"
                    >
                      <option value="CONTENT_ADMINISTRATOR">Content Administrator (Custom Sidebar)</option>
                      <option value="SYSTEM_ADMINISTRATOR">System Administrator (Full Privileges)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 text-xs font-semibold bg-[#6a1b2a] text-white rounded-xl hover:bg-[#8f2a3e] disabled:opacity-50 flex items-center gap-2 shadow"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Create Account</span>
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
