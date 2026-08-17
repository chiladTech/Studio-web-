'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/public/Header';
import MobileMenu from '@/components/public/MobileMenu';
import Footer from '@/components/public/Footer';
import { BookOpen, Calendar, User } from 'lucide-react';

export default function StoriesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);

  const defaultStories = [
    { id: '1', title: '10 Tips for Natural & Authentic Portraits', category: 'Tips & Tricks', author: 'Maya Pictures Studio', createdAt: new Date().toISOString(), excerpt: 'Learn how to make your subjects feel at ease and capture genuine expressions during outdoor and studio sessions.' },
    { id: '2', title: 'The Art of Cinematic Wedding Storytelling', category: 'Weddings', author: 'Maya Pictures Studio', createdAt: new Date().toISOString(), excerpt: 'How we approach a full wedding day to document a cohesive, emotional visual story from morning prep to evening dancing.' },
    { id: '3', title: 'Behind the Scenes: High-Fashion Editorial Shoot', category: 'Behind The Scenes', author: 'Maya Pictures Studio', createdAt: new Date().toISOString(), excerpt: 'Lighting setups, wardrobe selection, and directional cues for capturing high-fashion editorial imagery.' },
    { id: '4', title: 'Choosing the Perfect Photography Package', category: 'Guides', author: 'Maya Pictures Studio', createdAt: new Date().toISOString(), excerpt: 'A complete guide to help you decide between portrait, event, and full-day wedding coverage.' },
  ];

  useEffect(() => {
    async function loadDynamicStories() {
      try {
        const res = await fetch('/api/v1/stories');
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            setStories(data.data);
            return;
          }
        }
      } catch (e) {}
      setStories(defaultStories);
    }
    loadDynamicStories();
  }, []);

  const displayList = stories.length > 0 ? stories : defaultStories;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#6a1b2a] uppercase bg-[#f4e8ea] px-4 py-1.5 rounded-full mb-3">
            <BookOpen className="w-4 h-4" />
            <span>BEHIND THE LENS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1e1a1c]">
            Our <strong className="font-semibold text-[#6a1b2a]">Stories & Blog</strong>
          </h1>
          <p className="text-sm md:text-base text-[#4a3a3a] mt-3 leading-relaxed">
            Insights, photography advice, behind-the-scenes stories, and inspiration straight from the Maya Pictures team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {displayList.map((st) => (
            <article
              key={st.id}
              className="bg-white rounded-3xl p-8 border border-[#ece0e0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#6a1b2a] font-semibold uppercase tracking-wider mb-2">
                  <span>{st.category}</span>
                  <span className="flex items-center gap-1 text-gray-500 font-normal">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(st.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#1e1a1c] hover:text-[#6a1b2a] transition-colors mb-3">
                  {st.title}
                </h3>
                <p className="text-sm text-[#4a3a3a] leading-relaxed mb-4">{st.excerpt}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#6a5a5a]">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-[#6a1b2a]" />
                  {st.author}
                </span>
                <span className="font-semibold text-[#6a1b2a] uppercase tracking-wider">
                  READ STORY →
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
