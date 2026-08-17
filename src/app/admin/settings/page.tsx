'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Sliders, Save, CheckCircle, Loader2, Globe, Mail, Phone, MapPin, Plus, Trash2, Edit2, X, Share2, DollarSign
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

  useEffect(() => {
    async function init() {
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
      setLoading(false);
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
        setMessage('Studio global settings & social links saved successfully!');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (e) {
      setMessage('Error connecting to server.');
    } finally {
      setSaving(false);
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
                <Sliders className="w-5 h-5 text-[#6a1b2a]" />
                Studio Global Settings & Social Media Links
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Configure profile details, contact info, ETB currency, and add/edit/delete social links</p>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Studio Settings</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSaveAll} className="space-y-6 max-w-4xl">
            {/* Studio Profile Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
                <Globe className="w-4 h-4 text-[#6a1b2a]" />
                Studio Identity Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Studio Brand Name</label>
                  <input
                    type="text"
                    value={settings.studioName}
                    onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:border-[#6a1b2a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.currencySymbol}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                    placeholder="ETB"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono outline-none focus:border-[#6a1b2a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Studio Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
                <Mail className="w-4 h-4 text-[#6a1b2a]" />
                Studio Contact Info
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Physical Studio Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>
            </div>

            {/* Dynamic Social Media Links Manager Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
                  <Share2 className="w-4 h-4 text-[#6a1b2a]" />
                  Social Media Channels ({socialLinks.length} Active)
                </h2>
                <button
                  type="button"
                  onClick={handleOpenAddSocial}
                  className="flex items-center gap-1.5 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Social Link</span>
                </button>
              </div>

              <div className="space-y-3">
                {socialLinks.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-[#6a1b2a] transition-all">
                    <div>
                      <div className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#6a1b2a]" />
                        {item.platform}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono mt-0.5">{item.url}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSocial(item)}
                        className="p-2 text-neutral-600 hover:text-[#6a1b2a] hover:bg-white rounded-lg transition-all"
                        title="Edit Link"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSocial(item.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Link"
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
