import React from 'react';
import PublicNav from '@/components/public/PublicNav';
import Footer from '@/components/public/Footer';
import PortfolioGrid, { PortfolioGridItem } from '@/components/public/PortfolioGrid';
import EmptyState from '@/components/public/EmptyState';
import { getPublicSettings, getPublicPortfolioItems } from '@/lib/site-data';
import { Camera } from 'lucide-react';

export const revalidate = 60;

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

export default async function PortfolioPage() {
  const settings = await getPublicSettings();
  const itemsResult = await getPublicPortfolioItems();
  const showEmptyState = !itemsResult.error && itemsResult.data.length === 0;
  const displayItems = itemsResult.error ? defaultItems : itemsResult.data;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <PublicNav settings={settings} />

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

        {showEmptyState ? (
          <EmptyState
            icon={<Camera className="w-6 h-6 text-[#6a1b2a]" />}
            title="No portfolio projects available yet."
            message="Check back soon — new work will appear here once published."
          />
        ) : (
          <>
            {/* Dynamic Portfolio Category Filter & Grid */}
            <PortfolioGrid items={displayItems} showCategoryFilter priorityCount={4} />
          </>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
