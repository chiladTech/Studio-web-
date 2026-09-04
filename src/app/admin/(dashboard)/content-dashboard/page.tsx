'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, MessageSquareQuote, HelpCircle, Plus, Inbox, PenLine, Eye, Star
} from 'lucide-react';

export default function ContentAdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      setUser(data.user);

      // Only load content-specific data
      const [sRes, tRes, fRes] = await Promise.all([
        fetch('/api/v1/stories'),
        fetch('/api/v1/testimonials'),
        fetch('/api/v1/faq'),
      ]);
      if (sRes.ok) setStories((await sRes.json()).data || []);
      if (tRes.ok) setTestimonials((await tRes.json()).data || []);
      if (fRes.ok) setFaqs((await fRes.json()).data || []);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>
  );

  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">
            Welcome, <span className="text-[#6a1b2a]">{user?.fullName?.split(' ')[0] || 'Editor'}</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Content Administration Dashboard · Maya Pictures Studio
          </p>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            { label: 'Published Stories', value: stories.filter(s => s.isPublished).length, icon: BookOpen, color: 'text-[#6a1b2a]', bg: 'bg-[#f4e8ea]' },
            { label: 'Client Reviews', value: testimonials.length, icon: MessageSquareQuote, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'FAQ Answers', value: faqs.length, icon: HelpCircle, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                  <div className="text-xs text-neutral-500 font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Content Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-600 mb-5 flex items-center gap-2">
              <PenLine className="w-4 h-4 text-[#6a1b2a]" />
              Quick Content Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Write Story', href: '/admin/stories', icon: Plus },
                { label: 'Add Testimonial', href: '/admin/testimonials', icon: Star },
                { label: 'Add FAQ', href: '/admin/faq', icon: HelpCircle },
                { label: 'All Stories', href: '/admin/stories', icon: Eye },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex items-center gap-2 px-4 py-3 bg-neutral-50 hover:bg-[#f4e8ea] hover:text-[#6a1b2a] border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 transition-all"
                  >
                    <Icon className="w-4 h-4 text-[#6a1b2a]" />
                    {a.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Stories */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-600 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#6a1b2a]" />
                Recent Stories
              </h2>
              <Link href="/admin/stories" className="text-xs font-semibold text-[#6a1b2a] hover:underline">
                MANAGE ALL →
              </Link>
            </div>
            <div className="space-y-3">
              {stories.slice(0, 5).map((story) => (
                <div key={story.id} className="flex items-start justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-neutral-800 line-clamp-1">{story.title}</div>
                    <div className="text-xs text-neutral-500">{story.category}</div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ml-2 ${story.isPublished ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                    {story.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>
              ))}
              {stories.length === 0 && (
                <p className="text-xs text-neutral-400 py-4 text-center">No stories yet. Click "Write Story" to get started.</p>
              )}
            </div>
          </div>
        </div>

        {/* Content Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Stories & Blog', href: '/admin/stories', icon: BookOpen, desc: 'Write, edit and manage articles' },
            { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote, desc: 'Add client reviews & ratings' },
            { label: 'FAQ Manager', href: '/admin/faq', icon: HelpCircle, desc: 'Answer common client questions' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 hover:border-[#6a1b2a] hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f4e8ea] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#6a1b2a]" />
                </div>
                <div className="text-sm font-bold text-neutral-900 group-hover:text-[#6a1b2a]">{item.label}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{item.desc}</div>
              </Link>
            );
          })}
        </div>
    </main>
  );
}
