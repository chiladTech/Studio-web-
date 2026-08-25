'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Sliders, Save, CheckCircle, Loader2, Globe, Mail, Phone, MapPin, Plus, Trash2, Edit2, X, Share2, DollarSign, KeyRound, Eye, EyeOff, Lock
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState<any>({
    studioName: 'MAYA PICTURES',
    tagline: 'CAPTURING TIME, CRAFTING MEMORIES',
    contactEmail: 'contact@mayapictures.com',
    contactPhone: '+251 911 234 567',
    address: 'Bole Road, Mega Tower, 4th Floor, Addis Ababa, Ethiopia',
    currencySymbol: 'ETB',
  });

  const [socialLinks, setSocialLinks] = useState<any[]>([
    { id: '1', platform: 'Instagram', url: 'https://instagram.com/mayapictures' },
    { id: '2', platform: 'Telegram', url: 'https://t.me/mayapictures' },
    { id: '3', platform: 'YouTube', url: 'https://youtube.com/@mayapictures' },
    { id: '4', platform: 'TikTok', url: 'https://tiktok.com/@mayapictures' },
  ]);

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingSocial, setEditingSocial] = useState<any>(null);
  const [socialForm, setSocialForm] = useState({ platform: '', url: '' });

  // Security / Password change state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (!res.ok) { router.push('/admin/login'); return; }
        const data = await res.json();
        setUser(data.user);

        const sRes = await fetch('/api/v1/settings');
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.data) {
            const { socialLinks: loadedSocials, ...rest } = sData.data;
            setSettings((prev: any) => ({ ...prev, ...rest }));
            if (Array.isArray(loadedSocials)) {
              setSocialLinks(loadedSocials);
            } else if (typeof loadedSocials === 'string') {
              try { setSocialLinks(JSON.parse(loadedSocials)); } catch (e) {}
            }
          }
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const handleOpenAddSocial = () => {
    setEditingSocial(null);
    setSocialForm({ platform: 'Instagram', url: 'https://' });
    setShowSocialModal(true);
  };

  const handleOpenEditSocial = (item: any) => {
    setEditingSocial(item);
    setSocialForm({ platform: item.platform, url: item.url });
    setShowSocialModal(true);
  };

  const handleSaveSocialItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialForm.platform || !socialForm.url) return;

    if (editingSocial) {
      setSocialLinks((prev) =>
        prev.map((item) => (item.id === editingSocial.id ? { ...item, ...socialForm } : item))
      );
    } else {
      const newItem = {
        id: Date.now().toString(),
        ...socialForm,
      };
      setSocialLinks((prev) => [...prev, newItem]);
    }
    setShowSocialModal(false);
  };

  const handleDeleteSocial = (id: string) => {
    if (!confirm('Delete this social media link?')) return;
    setSocialLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        ...settings,
        socialLinks,
      };

      const res = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Studio settings and social links updated successfully!');
      } else {
        setMessage('Failed to update settings');
      }
    } catch (e) {
      setMessage('Network error while updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage('');
    setPwError('');

    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setChangingPw(true);

    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pwForm.newPassword,
          currentPassword: pwForm.currentPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPwMessage('Your password has been changed successfully!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwError(data.error || 'Failed to change password');
      }
    } catch (err: any) {
      setPwError('Network error while changing password');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#6a1b2a]" />
                Global Studio Settings & Profile Security
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Manage business information, contact channels, currency, social media links, and change your password
              </p>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSaveAll} className="space-y-6">
            {/* General Info */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#6a1b2a]" />
                Business Identity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Studio Name</label>
                  <input
                    type="text"
                    value={settings.studioName || ''}
                    onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Tagline / Slogan</label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6a1b2a]" />
                Contact & Studio Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    Public Contact Phone
                  </label>
                  <input
                    type="text"
                    value={settings.contactPhone || ''}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  Physical Studio Address
                </label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#6a1b2a]" />
                  Social Media Links
                </h2>
                <button
                  type="button"
                  onClick={handleOpenAddSocial}
                  className="flex items-center gap-1.5 bg-[#f4e8ea] hover:bg-[#e6d4d6] text-[#6a1b2a] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Social Link</span>
                </button>
              </div>

              <div className="space-y-3">
                {socialLinks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6a1b2a]/10 text-[#6a1b2a] flex items-center justify-center font-bold text-xs">
                        {item.platform?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-800">{item.platform}</div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-neutral-500 font-mono hover:text-[#6a1b2a] hover:underline truncate max-w-xs block"
                        >
                          {item.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSocial(item)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSocial(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {socialLinks.length === 0 && (
                  <div className="text-center py-6 text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-dashed">
                    No social media links added yet. Click "Add Social Link" above to add one.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save Studio Global Settings & Social Links</span>
              </button>
            </div>
          </form>

          {/* CHANGE PASSWORD CARD */}
          <div className="mt-10 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-[#6a1b2a]" />
              <h2 className="text-base font-bold text-neutral-900">
                Change Your Administrator Password
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mb-6">
              Update the login password for your active account ({user?.email})
            </p>

            {pwMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pwMessage}</span>
              </div>
            )}

            {pwError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-red-600 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 pr-10 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  New Password * (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 pr-10 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPw}
                  className="py-2.5 px-6 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Social Link Add/Edit Modal */}
          {showSocialModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h2 className="text-lg font-bold text-neutral-900">
                    {editingSocial ? 'Edit Social Media Link' : 'Add Social Media Link'}
                  </h2>
                  <button onClick={() => setShowSocialModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveSocialItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Platform Name</label>
                    <select
                      value={socialForm.platform}
                      onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a] bg-white font-semibold"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Telegram">Telegram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Facebook">Facebook</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Twitter/X">Twitter/X</option>
                      <option value="Pinterest">Pinterest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Channel / Profile URL</label>
                    <input
                      type="url"
                      required
                      value={socialForm.url}
                      onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                      placeholder="https://instagram.com/mayapictures"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a] font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowSocialModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-semibold bg-[#6a1b2a] text-white rounded-xl hover:bg-[#8f2a3e] transition-all shadow"
                    >
                      Save Link
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
