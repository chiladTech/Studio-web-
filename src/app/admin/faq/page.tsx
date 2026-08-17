'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { HelpCircle, Plus, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminFAQPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
  });

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      setUser(data.user);
      await loadFaqs();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadFaqs = async () => {
    const res = await fetch('/api/v1/faq');
    if (res.ok) {
      const data = await res.json();
      setFaqs(data.data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/v1/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('FAQ added successfully!');
        setFormData({ question: '', answer: '', category: 'General' });
        setShowModal(false);
        await loadFaqs();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error || 'Failed to create FAQ'}`);
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
                <HelpCircle className="w-5 h-5 text-[#6a1b2a]" />
                Frequently Asked Questions (FAQ)
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Manage common questions displayed on the FAQ page</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#6a1b2a] uppercase tracking-wider">{faq.category}</span>
                    <h3 className="font-bold text-neutral-900 text-base mt-1 mb-2">{faq.question}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{faq.answer}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase shrink-0">
                    Published
                  </span>
                </div>
              </div>
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Add FAQ Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Question</label>
                    <input
                      type="text"
                      required
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="e.g. How far in advance should we book?"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Booking & Payments"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Answer</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      placeholder="Detailed answer text..."
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
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
                      Save FAQ
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
