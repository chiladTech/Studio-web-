'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Plus, CheckCircle, Loader2, Edit2, Trash2, X, Upload, Image as ImageIcon, Eye, EyeOff
} from 'lucide-react';
import { uploadMediaDirect } from '@/lib/blob-client';

const CATEGORIES = [
  'Behind the Scenes', 'Wedding Stories', 'Tips & Guides', 'Studio News',
  'Client Spotlight', 'Photography Tips', 'Videography Guides', 'Seasonal Specials'
];

const EMPTY_FORM = {
  title: '', excerpt: '', content: '', category: 'Behind the Scenes',
  coverImage: '', author: 'Maya Pictures Studio', isPublished: true,
};

export default function AdminStoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      await loadStories();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadStories = async () => {
    const res = await fetch('/api/v1/stories');
    if (res.ok) {
      const data = await res.json();
      setStories(data.data || []);
    }
  };

  const openAdd = () => {
    setEditingStory(null);
    setFormData({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (story: any) => {
    setEditingStory(story);
    setFormData({
      title: story.title || '',
      excerpt: story.excerpt || '',
      content: story.content || '',
      category: story.category || 'Behind the Scenes',
      coverImage: story.coverImage || '',
      author: story.author || 'Maya Pictures Studio',
      isPublished: story.isPublished ?? true,
    });
    setShowModal(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const file = files[0];
      const result = await uploadMediaDirect(file, {
        category: 'stories',
      });
      setFormData((prev) => ({ ...prev, coverImage: result.url }));
    } catch (err: any) {
      console.error('Stories upload error:', err);
      alert(`Upload failed: ${err.message || 'Check connection'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const payload = { ...formData, slug };
      const isEdit = !!editingStory;
      const url = isEdit ? `/api/v1/stories/${editingStory.id}` : '/api/v1/stories';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage(isEdit ? 'Story updated successfully!' : 'Story published successfully!');
        setShowModal(false);
        await loadStories();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error || 'Failed to save story'}`);
      }
    } catch (e) {
      setMessage('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (story: any) => {
    if (!confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/v1/stories/${story.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Story deleted.');
        await loadStories();
      }
    } catch (e) {}
  };

  const handleTogglePublish = async (story: any) => {
    try {
      await fetch(`/api/v1/stories/${story.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !story.isPublished }),
      });
      await loadStories();
    } catch (e) {}
  };

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>
  );

  return (
    <>
      <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6a1b2a]" />
                Stories & Studio Blog
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Publish, edit, and manage behind-the-scenes stories and blog articles</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Write Story</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          {stories.length === 0 && (
            <div className="text-center py-20 text-neutral-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-semibold">No stories yet</p>
              <p className="text-xs mt-1">Click "Write Story" to publish your first blog article.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div key={story.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="h-44 bg-neutral-100 relative overflow-hidden">
                  {story.coverImage ? (
                    <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  {/* Publish badge */}
                  <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${story.isPublished ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'}`}>
                    {story.isPublished ? 'Published' : 'Draft'}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#6a1b2a] uppercase tracking-wider">{story.category}</span>
                    <h3 className="font-bold text-neutral-900 text-sm mt-1 mb-1 line-clamp-2">{story.title}</h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{story.excerpt}</p>
                  </div>
                  <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">{new Date(story.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublish(story)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-[#6a1b2a] transition-all"
                        title={story.isPublished ? 'Set to Draft' : 'Publish'}
                      >
                        {story.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEdit(story)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-[#6a1b2a] transition-all"
                        title="Edit Story"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(story)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-all"
                        title="Delete Story"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </main>

      {/* Add/Edit Story Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-6">
            <div className="flex items-center justify-between mb-5 border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-bold text-neutral-900">
                {editingStory ? 'Edit Story' : 'Write New Studio Story'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-2">Cover Photo / Image</label>
                <div className="flex items-start gap-3">
                  <div className="w-28 h-20 bg-neutral-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border">
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer bg-[#f4e8ea] hover:bg-[#e6d4d6] text-[#6a1b2a] border border-[#d8b8be] py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all w-full justify-center">
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Upload Cover Photo</span>
                      <input type="file" accept="image/*,video/*" className="hidden" onChange={handleCoverUpload} />
                    </label>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="Or paste image URL here..."
                      className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Story Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Behind the Lens: Ethiopian Wedding"
                    className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Maya Pictures Studio"
                    className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white outline-none focus:border-[#6a1b2a]"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-[#6a1b2a]"
                  />
                  <label htmlFor="isPublished" className="text-xs font-semibold text-neutral-700 cursor-pointer">
                    Publish immediately (uncheck to save as draft)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Short Excerpt / Summary *</label>
                <input
                  type="text"
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="A short teaser that appears in the blog listing..."
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Article Content *</label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full article content here. Use line breaks for paragraphs..."
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a] resize-y"
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
                  className="px-5 py-2.5 text-xs font-semibold bg-[#6a1b2a] text-white rounded-xl hover:bg-[#8f2a3e] disabled:opacity-50 flex items-center gap-2 shadow"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingStory ? 'Update Story' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
