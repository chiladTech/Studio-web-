'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Camera, Plus, Edit2, Trash2, CheckCircle, Loader2, Upload, Video, Image as ImageIcon, X, Play
} from 'lucide-react';

export default function AdminServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    shortDesc: '',
    longDesc: '',
    icon: 'Camera',
    coverImage: '/images/wedding-1.jpg',
  });

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      setUser(data.user);
      await loadServices();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadServices = async () => {
    const res = await fetch('/api/v1/services');
    if (res.ok) {
      const data = await res.json();
      setServices(data.data || []);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({ name: '', shortDesc: '', longDesc: '', icon: 'Camera', coverImage: '/images/wedding-1.jpg' });
    setShowModal(true);
  };

  const handleOpenEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      shortDesc: service.shortDesc || '',
      longDesc: service.longDesc || '',
      icon: service.icon || 'Camera',
      coverImage: service.coverImage || '/images/wedding-1.jpg',
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage('');

    try {
      const file = files[0];
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
        setMessage('Service photo/video uploaded successfully!');
      } else {
        setMessage('Upload failed.');
      }
    } catch (err) {
      setMessage('Error during file upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    const res = await fetch(`/api/v1/services/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Service deleted successfully.');
      await loadServices();
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error || 'Failed to delete service'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const url = editingService ? `/api/v1/services/${editingService.id}` : '/api/v1/services';
      const method = editingService ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingService ? 'Service updated successfully!' : 'Service created successfully!');
        setShowModal(false);
        await loadServices();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error || 'Failed to save service'}`);
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
                <Camera className="w-5 h-5 text-[#6a1b2a]" />
                Studio Services & Media Manager
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Create, edit, delete services and upload photos or video reels from your device</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const isVideo = service.coverImage?.endsWith('.mp4') || service.coverImage?.endsWith('.webm');
              return (
                <div key={service.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all">
                  <div>
                    <div className="h-44 relative bg-neutral-900 overflow-hidden flex items-center justify-center">
                      {isVideo ? (
                        <video src={service.coverImage} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={service.coverImage || '/images/wedding-1.jpg'} alt={service.name} className="w-full h-full object-cover" />
                      )}

                      {isVideo && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                            <Play className="w-5 h-5 text-[#6a1b2a] fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      <div className="absolute top-3 left-3 bg-[#6a1b2a] text-white p-2 rounded-xl shadow-lg">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-neutral-900 text-base mb-2">{service.name}</h3>
                      <p className="text-xs text-neutral-600 line-clamp-3 mb-4 leading-relaxed">{service.shortDesc}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-mono truncate max-w-[150px]">/{service.slug}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="p-2 text-neutral-600 hover:text-[#6a1b2a] hover:bg-white rounded-lg transition-all"
                        title="Edit Service & Media"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add / Edit Service Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h2 className="text-lg font-bold text-neutral-900">
                    {editingService ? 'Edit Studio Service' : 'Add New Studio Service'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Service Title</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Drone & Aerial Videography"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Service Photo or Video File</label>
                    <label className="cursor-pointer bg-[#f4e8ea] hover:bg-[#e6d4d6] text-[#6a1b2a] border border-[#d8b8be] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Upload Photo or Video File</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {/* Active Preview */}
                  <div>
                    <span className="block text-xs font-semibold text-neutral-600 mb-1">Active Cover Preview:</span>
                    <div className="h-32 w-full rounded-xl bg-neutral-900 overflow-hidden relative border flex items-center justify-center">
                      {formData.coverImage.endsWith('.mp4') || formData.coverImage.endsWith('.webm') ? (
                        <video src={formData.coverImage} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Short Description</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.shortDesc}
                      onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                      placeholder="Brief overview displayed on website..."
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
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
                      className="px-5 py-2.5 text-xs font-semibold bg-[#6a1b2a] text-white rounded-xl hover:bg-[#8f2a3e] disabled:opacity-50 flex items-center gap-2 shadow-md"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Service
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
