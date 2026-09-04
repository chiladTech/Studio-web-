'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquareQuote, Plus, CheckCircle, Loader2, Star } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    clientName: '',
    role: 'Bride & Groom',
    quote: '',
    rating: 5,
  });

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      await loadTestimonials();
      setLoading(false);
    }
    init();
  }, [router]);

  const loadTestimonials = async () => {
    const res = await fetch('/api/v1/testimonials');
    if (res.ok) {
      const data = await res.json();
      setTestimonials(data.data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/v1/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Testimonial added successfully!');
        setFormData({ clientName: '', role: 'Bride & Groom', quote: '', rating: 5 });
        setShowModal(false);
        await loadTestimonials();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error || 'Failed to create testimonial'}`);
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
                <MessageSquareQuote className="w-5 h-5 text-[#6a1b2a]" />
                Client Testimonials & Reviews
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Manage client feedback and quotes displayed on the website</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Review</span>
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6a1b2a]" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 italic mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-neutral-900">{t.clientName}</div>
                    <div className="text-xs text-neutral-400">{t.role}</div>
                  </div>
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase">
                    Published
                  </span>
                </div>
              </div>
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Add Client Review</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Client Name</label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="e.g. Almaz & Dawit"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Role / Occasion</label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Wedding Couple / Corporate Client"
                      className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#6a1b2a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Quote / Review Text</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.quote}
                      onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                      placeholder="Client's testimonial text..."
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
                      Save Testimonial
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </main>
  );
}
