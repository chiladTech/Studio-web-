'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Images, Plus, Edit2, Trash2, Star, CheckCircle, Loader2, Upload, Video, Image as ImageIcon, X, Play
} from 'lucide-react';
import { uploadMediaDirect } from '@/lib/blob-client';

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    coverImage: '/images/wedding-1.jpg',
    description: '',
    story: '',
    isFeatured: false,
    status: 'PUBLISHED',
  });

  const [projectMedia, setProjectMedia] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      setUser(data.user);
      await loadData();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadData = async () => {
    const pRes = await fetch('/api/v1/portfolio');
    if (pRes.ok) {
      const pData = await pRes.json();
      setProjects(pData.data || []);
    }
    const cRes = await fetch('/api/v1/categories');
    if (cRes.ok) {
      const cData = await cRes.json();
      setCategories(cData.data || []);
      if (cData.data?.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: cData.data[0].id }));
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      categoryId: categories[0]?.id || '',
      coverImage: '/images/wedding-1.jpg',
      description: '',
      story: '',
      isFeatured: false,
      status: 'PUBLISHED',
    });
    setProjectMedia([
      { src: '/images/wedding-1.jpg', type: 'image', caption: 'Main Cover Photo' }
    ]);
    setShowModal(true);
  };

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      categoryId: project.categoryId,
      coverImage: project.coverImage || '/images/wedding-1.jpg',
      description: project.description || '',
      story: project.story || '',
      isFeatured: project.isFeatured || false,
      status: project.status || 'PUBLISHED',
    });
    const existingMedia = project.media?.length > 0 ? project.media.map((m: any) => ({
      src: m.src,
      type: m.type || (m.src?.endsWith('.mp4') ? 'video' : 'image'),
      caption: m.caption || project.title,
    })) : [
      { src: project.coverImage || '/images/wedding-1.jpg', type: project.coverImage?.endsWith('.mp4') ? 'video' : 'image', caption: project.title }
    ];
    setProjectMedia(existingMedia);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage(`⏳ Uploading ${files.length} file(s) directly to Vercel Blob CDN...`);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setMessage(`⏳ Uploading "${file.name}" (${i + 1}/${files.length}) to Vercel Blob...`);

        const result = await uploadMediaDirect(file, {
          category: 'portfolio',
          onProgress: (percent) => {
            setMessage(`⏳ Uploading "${file.name}" (${i + 1}/${files.length}): ${percent}%`);
          },
        });

        if (isCover) {
          setFormData((prev) => ({ ...prev, coverImage: result.url }));
        }

        setProjectMedia((prev) => [
          ...prev,
          { src: result.url, type: result.isVideo ? 'video' : 'image', caption: file.name },
        ]);
      }
      setMessage('✅ Files uploaded to Vercel Blob successfully!');
    } catch (err: any) {
      console.error('Portfolio upload error:', err);
      setMessage(`❌ Error during file upload: ${err.message || 'Check your connection'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    setProjectMedia((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio project?')) return;
    const res = await fetch(`/api/v1/portfolio/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Project deleted successfully.');
      await loadData();
    }
  };

  const handleToggleFeatured = async (project: any) => {
    const res = await fetch(`/api/v1/portfolio/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !project.isFeatured }),
    });
    if (res.ok) await loadData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const url = editingProject ? `/api/v1/portfolio/${editingProject.id}` : '/api/v1/portfolio';
      const method = editingProject ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000),
        media: projectMedia,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage(editingProject ? 'Project updated successfully!' : 'Project created successfully!');
        setShowModal(false);
        await loadData();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error || 'Failed to save project'}`);
      }
    } catch (e) {
      setMessage('Network error');
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
                <Images className="w-5 h-5 text-[#6a1b2a]" />
                Portfolio Projects & Media Manager
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Upload high-resolution photos and cinema videos directly from your file manager</p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const isVideo = project.coverImage?.endsWith('.mp4') || project.coverImage?.endsWith('.webm');
              return (
                <div key={project.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
                  <div>
                    <div className="h-44 relative bg-neutral-900 overflow-hidden flex items-center justify-center">
                      {isVideo ? (
                        <video src={project.coverImage} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={project.coverImage || '/images/wedding-1.jpg'} alt={project.title} className="w-full h-full object-cover" />
                      )}

                      {isVideo && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                            <Play className="w-5 h-5 text-[#6a1b2a] fill-current ml-0.5" />
                          </div>
                        </div>
                      )}

                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${project.status === 'PUBLISHED' ? 'bg-green-500 text-white' : 'bg-neutral-700 text-white'}`}>
                        {project.status}
                      </span>
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${project.isFeatured ? 'bg-amber-400 text-black' : 'bg-black/60 text-white hover:bg-amber-400 hover:text-black'}`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {project.isFeatured ? 'Featured' : 'Mark Featured'}
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-neutral-900 text-base mb-1">{project.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-[#6a1b2a] bg-[#f4e8ea] px-2 py-0.5 rounded">
                          {project.category?.name || 'Category'}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {project.media?.length || 1} Media Files
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{project.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-mono truncate max-w-[150px]">{project.coverImage}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(project)}
                        className="p-2 text-neutral-600 hover:text-[#6a1b2a] hover:bg-white rounded-lg transition-all"
                        title="Edit Project & Media"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add / Edit Project Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-8">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h2 className="text-lg font-bold text-neutral-900">
                    {editingProject ? 'Edit Portfolio Project' : 'Create New Portfolio Project'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Traditional Ethiopian Wedding Coverage"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a] bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Cover Image or Video File</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer bg-[#f4e8ea] hover:bg-[#e6d4d6] text-[#6a1b2a] border border-[#d8b8be] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          <span>Upload File from Device</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, true)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Cover Preview */}
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
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief story or overview..."
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>

                  {/* Multiple Media Upload Section */}
                  <div className="pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                        Project Media Gallery ({projectMedia.length} Files)
                      </label>
                      <label className="cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photos or Videos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, false)}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-44 overflow-y-auto p-1 bg-neutral-50 rounded-xl border">
                      {projectMedia.map((m, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden bg-black h-20 border border-neutral-200">
                          {m.type === 'video' || m.src?.endsWith('.mp4') ? (
                            <video src={m.src} className="w-full h-full object-cover" />
                          ) : (
                            <img src={m.src} alt="Media" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featProj"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <label htmlFor="featProj" className="text-xs text-neutral-700 font-semibold">Highlight on Homepage Featured Gallery</label>
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
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Portfolio Project
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
