'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Home, Save, CheckCircle, Loader2, Video, Sparkles, Upload, Play, Layout } from 'lucide-react';

export default function AdminHomepageConfigPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState({
    heroTitle: 'CAPTURING TIME, CRAFTING MEMORIES',
    heroSubhead: 'Premier Photography & Videography Studio based in Addis Ababa, Ethiopia.',
    heroVideoUrl: '/background.mp4',
    ctaPrimaryText: 'EXPLORE WORK',
    ctaSecondaryText: 'BOOK SESSION',
    aboutHeadline: 'WE TELL STORIES THAT LAST FOR GENERATIONS',
    aboutContent: 'At Maya Pictures, we combine artistic vision with cutting-edge cinema technology to capture moments that matter. From grand Ethiopian cultural weddings to commercial fashion shoots, our team delivers high-definition visual storytelling.',
    portfolioHeadline: 'OUR PORTFOLIO · Moments We\'ve Captured',
    packagesHeadline: 'CHOOSE YOUR PERFECT PACKAGE · Packages That Fit Every Moment',
  });

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
          setSettings((prev) => ({ ...prev, ...sData.data }));
        }
      }
      setLoading(false);
    }
    init();
  }, [router]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Client-side size check (200MB)
    if (file.size > 200 * 1024 * 1024) {
      setMessage('❌ File too large. Maximum allowed size is 200MB.');
      return;
    }

    setUploading(true);
    setMessage(`⏳ Uploading "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB)...`);

    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        const newUrl = data.url;

        // 1. Update local UI state
        setSettings((prev) => ({ ...prev, heroVideoUrl: newUrl }));

        // 2. Auto-save the new video URL to settings immediately — don't make user click Save separately
        const saveRes = await fetch('/api/v1/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heroVideoUrl: newUrl }),
        });

        if (saveRes.ok) {
          setMessage(`✅ Hero background video uploaded and saved successfully! File: ${file.name}`);
        } else {
          setMessage(`✅ Video uploaded but settings auto-save failed. Click "Save Homepage Changes" to apply it.`);
        }
      } else {
        setMessage(`❌ Upload failed: ${data.error || 'Unknown error. Please try again.'}`);
      }
    } catch (err) {
      setMessage('❌ Network error during upload. Please check your connection and try again.');
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-uploaded if needed
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage('Homepage configuration saved successfully! Public home page is updated.');
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
                <Home className="w-5 h-5 text-[#6a1b2a]" />
                Homepage & Hero Video Manager
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Upload background videos and edit all text headlines displayed on the home page</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Homepage Changes</span>
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-2 ${
              message.startsWith('❌')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : message.startsWith('⚠️')
                ? 'bg-amber-50 border border-amber-200 text-amber-900'
                : message.startsWith('⏳')
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
            {/* Background Hero Video Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
                <Video className="w-4 h-4 text-[#6a1b2a]" />
                Hero Background Video Upload
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-2">
                  Upload New Hero Video File (.mp4 / .webm recommended)
                </label>
                <label className={`cursor-pointer border py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all max-w-md ${
                  uploading
                    ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                    : 'bg-[#f4e8ea] hover:bg-[#e6d4d6] text-[#6a1b2a] border-[#d8b8be]'
                }`}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploading ? 'Uploading, please wait...' : 'Choose & Upload Video File'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleVideoUpload}
                  />
                </label>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  Supported: MP4, WebM, OGG · Max size: 200MB · Video is automatically saved after upload
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Active Video URL <span className="text-neutral-400 font-normal">(auto-filled after upload, or paste a URL manually)</span>
                </label>
                <input
                  type="text"
                  value={settings.heroVideoUrl}
                  onChange={(e) => setSettings({ ...settings, heroVideoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono outline-none focus:border-[#6a1b2a]"
                  placeholder="/videos/your-video.mp4"
                />
              </div>

              {/* Active Hero Video Player Preview */}
              <div>
                <span className="block text-xs font-semibold text-neutral-600 mb-1">Live Video Preview:</span>
                <div className="h-56 w-full rounded-2xl bg-neutral-950 overflow-hidden relative border shadow-inner flex items-center justify-center">
                  {settings.heroVideoUrl ? (
                    <video
                      key={settings.heroVideoUrl}
                      src={settings.heroVideoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                      onError={() => setMessage('⚠️ Preview failed: the video URL may be invalid or the file has not fully saved yet.')}
                    />
                  ) : (
                    <div className="text-neutral-500 text-xs text-center">
                      <Play className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No video selected yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hero Headlines Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#6a1b2a]" />
                Hero Main Headline & Text
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Hero Main Title</label>
                <input
                  type="text"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  placeholder="CAPTURING TIME, CRAFTING MEMORIES"
                  className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:border-[#6a1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={settings.heroSubhead}
                  onChange={(e) => setSettings({ ...settings, heroSubhead: e.target.value })}
                  placeholder="Premier Photography & Videography Studio..."
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Primary CTA Button Label</label>
                  <input
                    type="text"
                    value={settings.ctaPrimaryText}
                    onChange={(e) => setSettings({ ...settings, ctaPrimaryText: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Secondary CTA Button Label</label>
                  <input
                    type="text"
                    value={settings.ctaSecondaryText}
                    onChange={(e) => setSettings({ ...settings, ctaSecondaryText: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
              </div>
            </div>

            {/* Homepage Section Headlines Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
                <Layout className="w-4 h-4 text-[#6a1b2a]" />
                Section Headlines & Story
              </h2>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">About Section Headline</label>
                <input
                  type="text"
                  value={settings.aboutHeadline}
                  onChange={(e) => setSettings({ ...settings, aboutHeadline: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:border-[#6a1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">About Section Story Text</label>
                <textarea
                  rows={3}
                  value={settings.aboutContent}
                  onChange={(e) => setSettings({ ...settings, aboutContent: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Portfolio Gallery Section Headline</label>
                <input
                  type="text"
                  value={settings.portfolioHeadline}
                  onChange={(e) => setSettings({ ...settings, portfolioHeadline: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Packages Section Headline</label>
                <input
                  type="text"
                  value={settings.packagesHeadline}
                  onChange={(e) => setSettings({ ...settings, packagesHeadline: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save All Homepage Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
