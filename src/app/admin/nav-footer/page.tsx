'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Navigation, Save, CheckCircle, Loader2, Plus, Trash2, Edit2, X, Layout, Link2, Upload, Image as ImageIcon, Sparkles, Calendar, RotateCcw
} from 'lucide-react';
import { uploadMediaDirect } from '@/lib/blob-client';

interface NavLink {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

interface FooterLink {
  id: string;
  label: string;
  href: string;
  column: 'quick' | 'services' | 'legal';
}

const DEFAULT_NAV: NavLink[] = [
  { id: '1', label: 'Home', href: '/' },
  { id: '2', label: 'Portfolio', href: '/portfolio' },
  { id: '3', label: 'Services', href: '/services' },
  { id: '4', label: 'Packages', href: '/packages' },
  { id: '5', label: 'Stories', href: '/stories' },
  { id: '6', label: 'About', href: '/about' },
  { id: '7', label: 'Contact', href: '/contact' },
];

const DEFAULT_FOOTER_QUICK: FooterLink[] = [
  { id: 'q1', label: 'About Us', href: '/about', column: 'quick' },
  { id: 'q2', label: 'Portfolio Gallery', href: '/portfolio', column: 'quick' },
  { id: 'q3', label: 'Packages & Pricing', href: '/packages', column: 'quick' },
  { id: 'q4', label: 'Stories & Blog', href: '/stories', column: 'quick' },
  { id: 'q5', label: 'Contact Studio', href: '/contact', column: 'quick' },
];

const DEFAULT_FOOTER_SERVICES: FooterLink[] = [
  { id: 's1', label: 'Wedding Photography', href: '/services', column: 'services' },
  { id: 's2', label: 'Portrait Photography', href: '/services', column: 'services' },
  { id: 's3', label: 'Event Photography', href: '/services', column: 'services' },
  { id: 's4', label: 'Fashion Photography', href: '/services', column: 'services' },
  { id: 's5', label: 'Product Photography', href: '/services', column: 'services' },
  { id: 's6', label: 'Nature & Commercial', href: '/services', column: 'services' },
];

const DEFAULT_FOOTER_LEGAL: FooterLink[] = [
  { id: 'l1', label: 'FAQ', href: '/faq', column: 'legal' },
  { id: 'l2', label: 'Privacy Policy', href: '/privacy', column: 'legal' },
  { id: 'l3', label: 'Terms & Conditions', href: '/terms', column: 'legal' },
];

export default function AdminNavFooterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');

  // Logo & CTA Settings
  const [logoUrl, setLogoUrl] = useState('/my-logo.png');
  const [headerCtaText, setHeaderCtaText] = useState('BOOK A SESSION');
  const [headerCtaLink, setHeaderCtaLink] = useState('/book');
  const [headerCtaVisible, setHeaderCtaVisible] = useState(true);

  // Link Lists
  const [navLinks, setNavLinks] = useState<NavLink[]>(DEFAULT_NAV);
  const [footerQuick, setFooterQuick] = useState<FooterLink[]>(DEFAULT_FOOTER_QUICK);
  const [footerServices, setFooterServices] = useState<FooterLink[]>(DEFAULT_FOOTER_SERVICES);
  const [footerLegal, setFooterLegal] = useState<FooterLink[]>(DEFAULT_FOOTER_LEGAL);

  const [showModal, setShowModal] = useState(false);
  const [modalSection, setModalSection] = useState<'nav' | 'quick' | 'services' | 'legal'>('nav');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [linkForm, setLinkForm] = useState({ label: '', href: '/' });

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
          if (sData.data.logoUrl) setLogoUrl(sData.data.logoUrl);
          if (sData.data.headerCtaText) setHeaderCtaText(sData.data.headerCtaText);
          if (sData.data.headerCtaLink) setHeaderCtaLink(sData.data.headerCtaLink);
          if (typeof sData.data.headerCtaVisible === 'boolean') setHeaderCtaVisible(sData.data.headerCtaVisible);
          if (sData.data.navLinks) setNavLinks(sData.data.navLinks);
          if (sData.data.footerQuick) setFooterQuick(sData.data.footerQuick);
          if (sData.data.footerServices) setFooterServices(sData.data.footerServices);
          if (sData.data.footerLegal) setFooterLegal(sData.data.footerLegal);
        }
      }
      setLoading(false);
    }
    init();
  }, [router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingLogo(true);
    setMessage('');

    try {
      const file = files[0];
      const result = await uploadMediaDirect(file, {
        category: 'logo',
      });

      setLogoUrl(result.url);
      setMessage('✅ Logo uploaded to Vercel Blob successfully! Click "Save All Changes" to publish across the website.');
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setMessage(`❌ Error during logo upload: ${err.message || 'Check connection'}`);
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleResetLogo = () => {
    setLogoUrl('/my-logo.png');
    setMessage('Logo reset to default template logo.');
  };

  const handleDeleteLogo = () => {
    if (!confirm('Remove custom logo? Website will display studio text title.')) return;
    setLogoUrl('');
    setMessage('Logo removed.');
  };

  const openAdd = (section: typeof modalSection) => {
    setEditingItem(null);
    setModalSection(section);
    setLinkForm({ label: '', href: '/' });
    setShowModal(true);
  };

  const openEdit = (item: any, section: typeof modalSection) => {
    setEditingItem(item);
    setModalSection(section);
    setLinkForm({ label: item.label, href: item.href });
    setShowModal(true);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = { id: editingItem?.id || Date.now().toString(), ...linkForm, column: modalSection as any };

    const updaters: Record<string, any> = {
      nav: setNavLinks,
      quick: setFooterQuick,
      services: setFooterServices,
      legal: setFooterLegal,
    };

    if (editingItem) {
      updaters[modalSection]((prev: any[]) => prev.map((i: any) => i.id === editingItem.id ? newItem : i));
    } else {
      updaters[modalSection]((prev: any[]) => [...prev, newItem]);
    }
    setShowModal(false);
  };

  const handleDeleteLink = (id: string, section: typeof modalSection) => {
    if (!confirm('Delete this link?')) return;
    const updaters: Record<string, any> = {
      nav: setNavLinks,
      quick: setFooterQuick,
      services: setFooterServices,
      legal: setFooterLegal,
    };
    updaters[section]((prev: any[]) => prev.filter((i: any) => i.id !== id));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        logoUrl,
        headerCtaText,
        headerCtaLink,
        headerCtaVisible,
        navLinks,
        footerQuick,
        footerServices,
        footerLegal,
      };

      const res = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Navigation bar logo, CTA button & all links saved successfully! Live website updated.');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch {
      setMessage('Server connection error.');
    } finally {
      setSaving(false);
    }
  };

  const LinkList = ({ items, section }: { items: any[]; section: typeof modalSection }) => (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xl hover:border-[#6a1b2a]/40 transition-all">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-3.5 h-3.5 text-[#6a1b2a] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-neutral-900">{item.label}</div>
              <div className="text-xs text-neutral-400 font-mono">{item.href}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => openEdit(item, section)} className="p-1.5 rounded-lg hover:bg-white hover:text-[#6a1b2a] text-neutral-500 transition-all">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDeleteLink(item.id, section)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-neutral-500 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center py-4 text-xs text-neutral-400 border border-dashed rounded-xl">
          No links added yet.
        </div>
      )}
    </div>
  );

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#6a1b2a]" />
                Navigation Bar & Footer Manager
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Upload brand logo, customize Book Session CTA button, and manage navigation links</p>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save All Navigation Changes</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-6 max-w-5xl">
            {/* TOP CARD: BRAND LOGO & BOOK SESSION BUTTON */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Manager Card */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#6a1b2a]" />
                    Brand Logo Manager
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="p-1.5 text-neutral-500 hover:text-[#6a1b2a] hover:bg-neutral-100 rounded-lg text-xs flex items-center gap-1 font-semibold"
                      title="Reset to default logo"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Default</span>
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleDeleteLogo}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs flex items-center gap-1 font-semibold"
                        title="Delete Logo Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Logo Preview Box */}
                <div className="p-4 bg-[#fcf9f6] border border-[#6a1b2a]/20 rounded-2xl flex items-center justify-between gap-4">
                  <div className="h-16 flex items-center justify-center bg-white px-4 py-2 rounded-xl border shadow-inner">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Navigation Logo Preview" className="h-12 w-auto object-contain" />
                    ) : (
                      <span className="text-sm font-bold text-[#6a1b2a] tracking-wider uppercase">Maya VIP Studio</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-neutral-800">
                      {logoUrl ? 'Active Logo Image' : 'Text Brand Title (No Image)'}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate max-w-[200px] font-mono">
                      {logoUrl || 'Using text fallback'}
                    </div>
                  </div>
                </div>

                {/* Upload Action */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Upload New Logo Image (.png, .svg, .webp, .jpg)</label>
                  <label className="cursor-pointer bg-[#f4e8ea] hover:bg-[#e6d4d6] text-[#6a1b2a] border border-[#d8b8be] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Upload Logo File from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Logo URL Path</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/my-logo.png"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono outline-none focus:border-[#6a1b2a]"
                  />
                </div>
              </div>

              {/* Book Session CTA Button Manager Card */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6a1b2a]" />
                  Header "Book Session" CTA Button
                </h2>

                <div className="p-4 bg-[#fcf9f6] border border-[#6a1b2a]/20 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-neutral-800 block">Button Preview:</span>
                    <div className="mt-1.5 inline-flex items-center gap-2 bg-[#6a1b2a] text-white px-5 py-2 rounded-full font-medium text-xs tracking-wider shadow-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{headerCtaText || 'BOOK A SESSION'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={headerCtaVisible}
                        onChange={(e) => setHeaderCtaVisible(e.target.checked)}
                        className="w-4 h-4 accent-[#6a1b2a]"
                      />
                      <span>Visible</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Button Label / Text</label>
                  <input
                    type="text"
                    value={headerCtaText}
                    onChange={(e) => setHeaderCtaText(e.target.value)}
                    placeholder="BOOK A SESSION"
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold outline-none focus:border-[#6a1b2a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Button Link Destination</label>
                  <input
                    type="text"
                    value={headerCtaLink}
                    onChange={(e) => setHeaderCtaLink(e.target.value)}
                    placeholder="/book"
                    className="w-full px-3 py-2 border rounded-xl text-sm font-mono outline-none focus:border-[#6a1b2a]"
                  />
                </div>
              </div>
            </div>

            {/* LINKS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Navigation Bar Links */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-700 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#6a1b2a]" />
                    Navigation Bar Menu Links
                  </h2>
                  <button onClick={() => openAdd('nav')} className="flex items-center gap-1 bg-[#6a1b2a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>
                <LinkList items={navLinks} section="nav" />
              </div>

              {/* Footer Quick Links */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-700 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-[#6a1b2a]" />
                    Footer — Quick Links
                  </h2>
                  <button onClick={() => openAdd('quick')} className="flex items-center gap-1 bg-[#6a1b2a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>
                <LinkList items={footerQuick} section="quick" />
              </div>

              {/* Footer Services Links */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-700 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#6a1b2a]" />
                    Footer — Services Links
                  </h2>
                  <button onClick={() => openAdd('services')} className="flex items-center gap-1 bg-[#6a1b2a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>
                <LinkList items={footerServices} section="services" />
              </div>

              {/* Footer Legal Links */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-700 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-[#6a1b2a]" />
                    Footer — Legal Links
                  </h2>
                  <button onClick={() => openAdd('legal')} className="flex items-center gap-1 bg-[#6a1b2a] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                </div>
                <LinkList items={footerLegal} section="legal" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Link Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-base font-bold text-neutral-900">
                {editingItem ? 'Edit Link' : 'Add New Link'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Link Label (Text shown)</label>
                <input
                  type="text"
                  required
                  value={linkForm.label}
                  onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                  placeholder="e.g. Portfolio Gallery"
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Link URL / Path</label>
                <input
                  type="text"
                  required
                  value={linkForm.href}
                  onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                  placeholder="/portfolio  or  https://..."
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono outline-none focus:border-[#6a1b2a]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-xs font-semibold bg-[#6a1b2a] text-white rounded-xl hover:bg-[#8f2a3e] shadow">Save Link</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
