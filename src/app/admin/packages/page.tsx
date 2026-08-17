'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Tags, Plus, Edit2, Trash2, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    priceDisplay: '5,000 ETB +',
    description: '',
    duration: 'Full Day',
    isFeatured: false,
  });

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      setUser(data.user);
      await loadPackages();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadPackages = async () => {
    const res = await fetch('/api/v1/packages');
    if (res.ok) {
      const data = await res.json();
      setPackages(data.data || []);
    }
  };

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormData({ name: '', priceDisplay: '5,000 ETB +', description: '', duration: 'Full Day', isFeatured: false });
    setShowModal(true);
  };

  const handleOpenEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      priceDisplay: pkg.priceDisplay || '',
      description: pkg.description || '',
      duration: pkg.duration || 'Full Day',
      isFeatured: pkg.isFeatured || false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package tier?')) return;
    const res = await fetch(`/api/v1/packages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Package deleted successfully.');
      await loadPackages();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const url = editingPackage ? `/api/v1/packages/${editingPackage.id}` : '/api/v1/packages';
      const method = editingPackage ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingPackage ? 'Package updated successfully!' : 'Package created successfully!');
        setShowModal(false);
        await loadPackages();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error || 'Failed to save package'}`);
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
                <Tags className="w-5 h-5 text-[#6a1b2a]" />
                ETB Packages & Pricing Manager
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Manage client pricing tiers (Beauty, Standard, Premium)</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Package</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`bg-white rounded-2xl border ${pkg.isFeatured ? 'border-[#6a1b2a] ring-2 ring-[#6a1b2a]/10' : 'border-neutral-200'} shadow-sm p-6 flex flex-col justify-between`}>
                <div>
                  {pkg.isFeatured && (
                    <span className="bg-[#b8865a] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-3 inline-block">
                      POPULAR CHOICE
                    </span>
                  )}
                  <h3 className="font-bold text-neutral-900 text-lg mb-1">{pkg.name}</h3>
                  <div className="text-xl font-extrabold text-[#6a1b2a] mb-3">{pkg.priceDisplay}</div>
                  <p className="text-xs text-neutral-600 mb-4">{pkg.description}</p>
                </div>
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-mono">/{pkg.slug}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-2 text-neutral-600 hover:text-[#6a1b2a] hover:bg-neutral-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">
                  {editingPackage ? 'Edit Package Tier' : 'Add Package Tier'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Package Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. VIP WEDDING PACKAGE"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Price Display (ETB)</label>
                    <input
                      type="text"
                      required
                      value={formData.priceDisplay}
                      onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
                      placeholder="15,000 ETB +"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What is included in this package..."
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featPkg"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <label htmlFor="featPkg" className="text-xs text-neutral-700 font-semibold">Highlight as Popular Package</label>
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
                      Save Package
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
