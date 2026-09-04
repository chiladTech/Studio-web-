'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import LightboxModal, { LightboxItem } from './LightboxModal';

export interface PortfolioGridItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  label: string;
  subLabel?: string;
  category?: string;
}

interface PortfolioGridProps {
  items: PortfolioGridItem[];
  showCategoryFilter?: boolean;
  /** Number of leading image tiles to treat as above-the-fold (eager + priority). */
  priorityCount?: number;
}

/**
 * Tile video: only starts downloading/playing when the tile approaches the
 * viewport, pauses and unloads when it scrolls away, and never autoplays on
 * mobile / data-saver / reduced-motion. Prevents every gallery video from
 * streaming simultaneously.
 */
function LazyTileVideo({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setNearViewport(entry.isIntersecting);
        }
      },
      { rootMargin: '300px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!nearViewport) {
      el.pause();
      if (el.hasAttribute('src')) {
        el.removeAttribute('src');
        el.load();
      }
      return;
    }

    // Don't force large video downloads on mobile / data-saver / reduced-motion.
    if (window.matchMedia('(max-width: 767px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const mqReducedData = window.matchMedia('(prefers-reduced-data: reduce)');
    if (typeof mqReducedData.matches === 'boolean' && mqReducedData.matches) return;

    el.src = src;
    el.play().catch(() => {
      // Autoplay may be blocked (e.g. low-power mode); the poster tile remains.
    });
  }, [nearViewport, src]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    />
  );
}

export default function PortfolioGrid({ items, showCategoryFilter = false, priorityCount = 0 }: PortfolioGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const categories = ['ALL', 'Wedding', 'Portraits', 'Events', 'Fashion', 'Product', 'Nature'];

  const filteredItems = selectedCategory === 'ALL'
    ? items
    : items.filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase() || item.label.toLowerCase() === selectedCategory.toLowerCase()
      );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxMediaList: LightboxItem[] = filteredItems.map((item) => ({
    type: item.type,
    src: item.src,
    label: item.label,
    subLabel: item.subLabel,
  }));

  let imageIndex = 0;

  return (
    <div>
      {/* Optional Category Filter Pills */}
      {showCategoryFilter && (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 my-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[#6a1b2a] text-white shadow-md'
                  : 'bg-[#f4e8ea] text-[#6a1b2a] hover:bg-[#e6d4d6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {filteredItems.map((item, idx) => {
          const isPriorityImage = item.type === 'image' && imageIndex < priorityCount;
          if (item.type === 'image') imageIndex += 1;

          return (
            <div
              key={item.id || idx}
              onClick={() => openLightbox(idx)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-neutral-900 border border-[#6a1b2a]/10 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end p-5"
            >
              {item.type === 'video' ? (
                <>
                  <LazyTileVideo
                    src={item.src}
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 z-10 group-hover:bg-black/15 transition-all duration-300" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#6a1b2a] transition-all duration-300 shadow-xl">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </>
              ) : (
                <>
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    priority={isPriorityImage}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="absolute inset-0 object-cover z-0 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity" />
                </>
              )}

              {/* Labels overlay */}
              <div className="relative z-20 flex flex-col gap-1 items-start">
                <span className="bg-white/90 backdrop-blur-sm text-[#6a1b2a] font-semibold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full shadow-sm">
                  {item.label}
                </span>
                {item.subLabel && (
                  <span className="bg-white/70 backdrop-blur-sm text-neutral-800 text-[11px] px-3 py-0.5 rounded-full font-medium">
                    {item.subLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal Instance */}
      <LightboxModal
        isOpen={lightboxOpen}
        items={lightboxMediaList}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
}
