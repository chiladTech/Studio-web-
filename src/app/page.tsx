'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import MobileMenu from '@/components/public/MobileMenu';
import HeroSection from '@/components/public/HeroSection';
import PortfolioGrid, { PortfolioGridItem } from '@/components/public/PortfolioGrid';
import PackageCard from '@/components/public/PackageCard';
import Footer from '@/components/public/Footer';
import { ArrowRight, Quote } from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroSettings, setHeroSettings] = useState<any>({
    heroTitle: 'CAPTURING TIME, CRAFTING MEMORIES',
    heroSubhead: 'Premier Photography & Videography Studio based in Addis Ababa, Ethiopia.',
    heroVideoUrl: '/background.mp4',
    ctaPrimaryText: 'BOOK A SESSION',
    ctaSecondaryText: 'VIEW PORTFOLIO',
  });
  const [portfolioItems, setPortfolioItems] = useState<PortfolioGridItem[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  const defaultPortfolioItems: PortfolioGridItem[] = [
    { id: 'w1', type: 'image', src: '/images/wedding-1.jpg', label: 'WEDDING', subLabel: 'Love Stories', category: 'wedding' },
    { id: 'p1', type: 'image', src: '/images/portrait_1.jpg', label: 'PORTRAITS', subLabel: 'People & Expressions', category: 'portraits' },
    { id: 'e1', type: 'image', src: '/images/event-1.jpg', label: 'EVENTS', subLabel: 'Moments & Memories', category: 'events' },
    { id: 'p2', type: 'image', src: '/images/portrait_2.jpg', label: 'PORTRAITS', subLabel: 'People & Expressions', category: 'portraits' },
    { id: 'n1', type: 'image', src: '/images/nature-1.jpg', label: 'NATURE', subLabel: 'Wildlife & Landscapes', category: 'nature' },
    { id: 'pr1', type: 'image', src: '/images/product-1.jpg', label: 'PRODUCT', subLabel: 'High-Quality Imagery', category: 'product' },
    { id: 'wv1', type: 'video', src: '/images/wedding-video.mp4', label: 'WEDDING', subLabel: 'Highlight Film', category: 'wedding' },
    { id: 'ev1', type: 'video', src: '/images/event-video.mp4', label: 'EVENTS', subLabel: 'Event Recap', category: 'events' },
    { id: 'fv1', type: 'video', src: '/images/fashion-video.mp4', label: 'FASHION', subLabel: 'Editorial Reel', category: 'fashion' },
    { id: 'sh1', type: 'video', src: '/images/ሽምግልና-video.mp4', label: 'ሽምግልና', subLabel: 'Cultural Ceremony', category: 'wedding' },
  ];

  const defaultPackages = [
    { id: '1', name: 'BEAUTY', priceDisplay: '2,000 ETB +', description: 'Perfect for small sessions & personal portraits.', duration: '1-2 Hours', deliverables: '15 Edited Digital Photos, Online Gallery, 1 Print', isFeatured: false },
    { id: '2', name: 'STANDARD', priceDisplay: '10,000 - 15,000 ETB +', description: 'Ideal for events, engagements & family sessions.', duration: 'Half-Day (4 Hours)', deliverables: '50 Edited Digital Photos, Full HD Highlights Video, Online Gallery', isFeatured: true },
    { id: '3', name: 'PREMIUM', priceDisplay: '80,000 ETB +', description: 'Complete all-inclusive coverage for your big day.', duration: 'Full Day Coverage', deliverables: 'Full Wedding Story, 4K Cinema Video, Photo Album, Drone Coverage, All RAW Files', isFeatured: false },
  ];

  const defaultTestimonials = [
    { clientName: 'Sarah & Henok', role: 'Wedding Client', quote: 'Amazing experience! The photos turned out better than we imagined. Highly professional and super easy to work with.' },
    { clientName: 'Michael & Emily', role: 'Engagement Session', quote: 'Incredible eye for detail and creativity. Captured our wedding day so beautifully. We will cherish these forever!' },
    { clientName: 'David Thompson', role: 'Corporate Event', quote: 'Very professional, punctual and talented. The photos speak for themselves. Highly recommended for any corporate gala!' },
  ];

  useEffect(() => {
    async function loadHomePageData() {
      // 1. Settings
      try {
        const sRes = await fetch('/api/v1/settings');
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.data) setHeroSettings((prev: any) => ({ ...prev, ...sData.data }));
        }
      } catch (e) {}

      // 2. Portfolio
      try {
        const pRes = await fetch('/api/v1/portfolio');
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.data && pData.data.length > 0) {
            const mapped = pData.data.map((p: any) => ({
              id: p.id,
              type: p.coverImage?.endsWith('.mp4') ? 'video' : 'image',
              src: p.coverImage || '/images/wedding-1.jpg',
              label: p.title.toUpperCase(),
              subLabel: p.category?.name || 'STUDIO WORK',
              category: p.category?.slug || 'all',
            }));
            setPortfolioItems(mapped);
          }
        }
      } catch (e) {}

      // 3. Packages
      try {
        const pkgRes = await fetch('/api/v1/packages');
        if (pkgRes.ok) {
          const pkgData = await pkgRes.json();
          if (pkgData.data && pkgData.data.length > 0) setPackages(pkgData.data);
        }
      } catch (e) {}

      // 4. Testimonials
      try {
        const tRes = await fetch('/api/v1/testimonials');
        if (tRes.ok) {
          const tData = await tRes.json();
          if (tData.data && tData.data.length > 0) setTestimonials(tData.data);
        }
      } catch (e) {}
    }

    loadHomePageData();
  }, []);

  const displayPortfolio = portfolioItems.length > 0 ? portfolioItems : defaultPortfolioItems;
  const displayPackages = packages.length > 0 ? packages : defaultPackages;
  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full">
        {/* HERO SECTION WITH DYNAMIC PROPS */}
        <HeroSection
          videoUrl={heroSettings.heroVideoUrl || '/background.mp4'}
          titleLine1={heroSettings.heroTitle || "CAPTURING TIME, CRAFTING MEMORIES"}
          titleLine2=""
          tagline={heroSettings.heroSubhead || "Premier Photography & Videography Studio based in Addis Ababa, Ethiopia."}
          ctaPrimaryText={heroSettings.ctaPrimaryText || 'BOOK A SESSION'}
          ctaSecondaryText={heroSettings.ctaSecondaryText || 'VIEW PORTFOLIO'}
        />

        {/* CATEGORIES BAR */}
        <section className="my-12 border-t border-[#e8d8d8] pt-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <Link
              href="/portfolio?cat=wedding"
              className="flex flex-col items-center justify-center p-4 bg-[#f4e8ea] hover:bg-[#e6d4d6] rounded-2xl text-xs md:text-sm font-semibold uppercase text-[#2e2a2a] tracking-wider transition-all duration-200"
            >
              <i className="fas fa-ring text-2xl text-[#6a1b2a] mb-2" />
              <span>Wedding</span>
            </Link>
            <Link
              href="/portfolio?cat=portraits"
              className="flex flex-col items-center justify-center p-4 bg-[#f4e8ea] hover:bg-[#e6d4d6] rounded-2xl text-xs md:text-sm font-semibold uppercase text-[#2e2a2a] tracking-wider transition-all duration-200"
            >
              <i className="fas fa-user text-2xl text-[#6a1b2a] mb-2" />
              <span>Portraits</span>
            </Link>
            <Link
              href="/portfolio?cat=events"
              className="flex flex-col items-center justify-center p-4 bg-[#f4e8ea] hover:bg-[#e6d4d6] rounded-2xl text-xs md:text-sm font-semibold uppercase text-[#2e2a2a] tracking-wider transition-all duration-200"
            >
              <i className="fas fa-calendar-check text-2xl text-[#6a1b2a] mb-2" />
              <span>Events</span>
            </Link>
            <Link
              href="/portfolio?cat=fashion"
              className="flex flex-col items-center justify-center p-4 bg-[#f4e8ea] hover:bg-[#e6d4d6] rounded-2xl text-xs md:text-sm font-semibold uppercase text-[#2e2a2a] tracking-wider transition-all duration-200"
            >
              <i className="fas fa-tshirt text-2xl text-[#6a1b2a] mb-2" />
              <span>Fashion</span>
            </Link>
            <Link
              href="/portfolio?cat=product"
              className="flex flex-col items-center justify-center p-4 bg-[#f4e8ea] hover:bg-[#e6d4d6] rounded-2xl text-xs md:text-sm font-semibold uppercase text-[#2e2a2a] tracking-wider transition-all duration-200"
            >
              <i className="fas fa-box text-2xl text-[#6a1b2a] mb-2" />
              <span>Product</span>
            </Link>
            <Link
              href="/portfolio?cat=nature"
              className="flex flex-col items-center justify-center p-4 bg-[#f4e8ea] hover:bg-[#e6d4d6] rounded-2xl text-xs md:text-sm font-semibold uppercase text-[#2e2a2a] tracking-wider transition-all duration-200"
            >
              <i className="fas fa-tree text-2xl text-[#6a1b2a] mb-2" />
              <span>Nature</span>
            </Link>
          </div>
        </section>

        {/* FEATURED PORTFOLIO SECTION */}
        <section className="my-16">
          <div className="flex flex-wrap items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-[#1e1a1c]">
                <strong className="font-semibold text-[#6a1b2a]">OUR PORTFOLIO</strong> · Moments We&apos;ve Captured
              </h2>
              <p className="text-xs sm:text-sm text-[#5a4a4a] mt-1">Tap any photo or video to open full-screen lightbox</p>
            </div>

            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6a1b2a] hover:underline pb-1 border-b border-[#6a1b2a]"
            >
              <span>VIEW ALL GALLERY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <PortfolioGrid items={displayPortfolio} />
        </section>

        {/* FEATURED PACKAGES SECTION */}
        <section className="my-20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#1e1a1c] mb-3">
            CHOOSE YOUR PERFECT PACKAGE · <strong className="font-semibold text-[#6a1b2a]">Packages That Fit Every Moment</strong>
          </h2>
          <p className="text-sm text-[#5a4a4a] max-w-xl mx-auto mb-12">
            Transparent ETB pricing for sessions, events, and complete wedding coverage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {displayPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                name={pkg.name}
                priceDisplay={pkg.priceDisplay}
                description={pkg.description}
                duration={pkg.duration || 'Flexible'}
                deliverables={typeof pkg.deliverables === 'string' ? pkg.deliverables : JSON.stringify(pkg.deliverables || '')}
                isFeatured={pkg.isFeatured}
              />
            ))}
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="my-20 bg-[#f4e8ea] rounded-[40px] p-8 sm:p-12 md:p-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-center text-[#1e1a1c] mb-12">
            <strong className="font-semibold text-[#6a1b2a]">KIND WORDS</strong> · What Our Clients Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((t, idx) => (
              <div key={t.id || idx} className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
                <Quote className="w-8 h-8 text-[#6a1b2a]/30" />
                <p className="text-sm sm:text-base text-[#2a2222] leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-[#6a1b2a] text-sm">{t.clientName}</div>
                  <div className="text-xs text-[#6a5a5a]">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
