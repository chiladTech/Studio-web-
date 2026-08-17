'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/public/Header';
import MobileMenu from '@/components/public/MobileMenu';
import PortfolioGrid, { PortfolioGridItem } from '@/components/public/PortfolioGrid';
import Footer from '@/components/public/Footer';
import { Camera } from 'lucide-react';

export default function PortfolioPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [items, setItems] = useState<PortfolioGridItem[]>([]);

  const defaultItems: PortfolioGridItem[] = [
    { id: 'w1', type: 'image', src: '/images/wedding-1.jpg', label: 'WEDDING', subLabel: 'Love Stories', category: 'wedding' },
    { id: 'w2', type: 'image', src: '/images/wedding-2.jpg', label: 'WEDDING', subLabel: 'Ceremony Moments', category: 'wedding' },
    { id: 'p1', type: 'image', src: '/images/portrait_1.jpg', label: 'PORTRAITS', subLabel: 'People & Expressions', category: 'portraits' },
    { id: 'p2', type: 'image', src: '/images/portrait_2.jpg', label: 'PORTRAITS', subLabel: 'Personal Branding', category: 'portraits' },
    { id: 'e1', type: 'image', src: '/images/event-1.jpg', label: 'EVENTS', subLabel: 'Corporate Gala', category: 'events' },
    { id: 'e2', type: 'image', src: '/images/event-2.jpg', label: 'EVENTS', subLabel: 'Private Celebration', category: 'events' },
    { id: 'e3', type: 'image', src: '/images/event-3.jpg', label: 'EVENTS', subLabel: 'Stage Highlights', category: 'events' },
    { id: 'e4', type: 'image', src: '/images/event-4.jpg', label: 'EVENTS', subLabel: 'Evening Audience', category: 'events' },
    { id: 'pr1', type: 'image', src: '/images/product-1.jpg', label: 'PRODUCT', subLabel: 'Luxury Showcase', category: 'product' },
    { id: 'pr2', type: 'image', src: '/images/product-2.jpg', label: 'PRODUCT', subLabel: 'Brand Display', category: 'product' },
    { id: 'n1', type: 'image', src: '/images/nature-1.jpg', label: 'NATURE', subLabel: 'Landscapes', category: 'nature' },
    { id: 'n2', type: 'image', src: '/images/nature-2.jpg', label: 'NATURE', subLabel: 'Wildlife & Natural Light', category: 'nature' },
    { id: 'v1', type: 'video', src: '/images/wedding-video.mp4', label: 'WEDDING', subLabel: 'Highlight Film', category: 'wedding' },
    { id: 'v2', type: 'video', src: '/images/ሽምግልና-video.mp4', label: 'ሽምግልና', subLabel: 'Cultural Ceremony', category: 'wedding' },
    { id: 'v3', type: 'video', src: '/images/ሽምግልና1-video.mp4', label: 'ሽምግልና1', subLabel: 'Behind the Scenes', category: 'events' },
    { id: 'v4', type: 'video', src: '/images/event-video.mp4', label: 'EVENTS', subLabel: 'Event Recap', category: 'events' },
    { id: 'v5', type: 'video', src: '/images/fashion-video.mp4', label: 'FASHION', subLabel: 'Editorial Reel', category: 'fashion' },
  ];

  useEffect(() => {
    async function fetchDynamicPortfolio() {
      try {
        const res = await fetch('/api/v1/portfolio');
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            const mapped: PortfolioGridItem[] = data.data.map((p: any) => ({
              id: p.id,
              type: p.coverImage?.endsWith('.mp4') ? 'video' : 'image',
              src: p.coverImage || '/images/wedding-1.jpg',
              label: p.title.toUpperCase(),
              subLabel: p.category?.name || 'STUDIO WORK',
              category: p.category?.slug || 'all',
            }));
            setItems(mapped);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }
      setItems(defaultItems);
    }
    fetchDynamicPortfolio();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#6a1b2a] uppercase bg-[#f4e8ea] px-4 py-1.5 rounded-full mb-3">
            <Camera className="w-4 h-4" />
            <span>MAYA PICTURES GALLERY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1e1a1c]">
            Our <strong className="font-semibold text-[#6a1b2a]">Portfolio</strong>
          </h1>
          <p className="text-sm md:text-base text-[#4a3a3a] mt-3 leading-relaxed">
            Every image and cinema reel tells a unique story. Tap any item to launch full-screen lightbox controls.
          </p>
        </div>

        {/* Dynamic Portfolio Category Filter & Grid */}
        <PortfolioGrid items={items.length > 0 ? items : defaultItems} showCategoryFilter />
      </main>

      <Footer />
    </div>
  );
}
