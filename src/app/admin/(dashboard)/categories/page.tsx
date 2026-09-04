'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderTree, Plus, Edit2, Trash2, CheckCircle, Loader2, Upload, Video, Image as ImageIcon, X, Play
} from 'lucide-react';
import { uploadMediaDirect } from '@/lib/blob-client';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    coverImage: '/images/wedding-1.jpg',
  });

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      await loadCategories();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadCategories = async () => {
    const res = await fetch('/api/v1/categories');
    if (res.ok) {
      const data = await res.json();
      setCategories(data.data || []);
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', coverImage: '/images/wedding-1.jpg' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      coverImage: cat.coverImage || '/images/wedding-1.jpg',
    });
    setShowModal(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({ ...prev, name: val, slug: autoSlug }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];
    setMessage(`⏳ Uploading "${file.name}"...`);

    try {
      const result = await uploadMediaDirect(file, {
        category: 'gallery',
        onProgress: (percent) => {
          setMessage(`⏳ Uploading "${file.name}": ${percent}%`);
        },
      });

      setFormData((prev) => ({ ...prev, coverImage: result.url }));
      setMessage('✅ Category photo uploaded successfully!');
    } catch (err: any) {
      console.error('Category upload error:', err);
      setMessage(`❌ Error during file upload: ${err.message || 'Check connection'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const res = await fetch(`/api/v1/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Category deleted successfully.');
      await loadCategories();
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error || 'Failed to delete category'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const url = editingCategory ? `/api/v1/categories/${editingCategory.id}` : '/api/v1/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        setShowModal(false);
        await loadCategories();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error || 'Failed to save category'}`);
      }
    } catch (e) {
      setMessage('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>;

  return (
    <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#6a1b2a]" />
                Portfolio Categories Manager
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Create, edit, delete, and upload cover photos or videos for portfolio categories</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const isVideo = cat.coverImage?.endsWith('.mp4') || cat.coverImage?.endsWith('.webm');
              return (
                <div key={cat.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-xl bg-neutral-900 overflow-hidden shrink-0 relative flex items-center justify-center border">
                      {isVideo ? (
                        <video src={cat.coverImage} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={cat.coverImage || '/images/wedding-1.jpg'} alt={cat.name} className="w-full h-full object-cover" />
                      )}
                      {isVideo && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-neutral-900 text-base">{cat.name}</h3>
                      <p className="text-xs font-mono text-neutral-400 mt-0.5">/{cat.slug}</p>
                      <div className="text-xs text-[#6a1b2a] font-semibold mt-2 bg-[#f4e8ea] inline-block px-2.5 py-0.5 rounded-md">
                        {cat._count?.projects || 0} Linked Projects
                      </div>
                    </div>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-neutral-600 mb-4 line-clamp-2">{cat.description}</p>
                  )}

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[150px]">{cat.coverImage}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 text-neutral-600 hover:text-[#6a1b2a] hover:bg-neutral-50 rounded-lg transition-all"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add / Edit Category Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h2 className="text-lg font-bold text-neutral-900">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="e.g. Cultural Ceremonies"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Slug</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm font-mono bg-neutral-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Cover Photo or Video File</label>
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
                    <div className="h-28 w-full rounded-xl bg-neutral-900 overflow-hidden relative border flex items-center justify-center">
                      {formData.coverImage.endsWith('.mp4') || formData.coverImage.endsWith('.webm') ? (
                        <video src={formData.coverImage} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Short description of this photography category..."
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
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </main>
  );
}
