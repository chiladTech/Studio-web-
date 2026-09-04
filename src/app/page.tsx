import React from 'react';
import Link from 'next/link';
import PublicNav from '@/components/public/PublicNav';
import HeroSection from '@/components/public/HeroSection';
import PortfolioGrid, { PortfolioGridItem } from '@/components/public/PortfolioGrid';
import PackageCard from '@/components/public/PackageCard';
import Footer from '@/components/public/Footer';
import {
  getPublicSettings,
  getPublicPortfolioItems,
  getPackages,
  getTestimonials,
} from '@/lib/site-data';
import { ArrowRight, Quote, Gem, User, CalendarCheck, Shirt, Package, TreePine } from 'lucide-react';

export const revalidate = 60;

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

const categoryLinks = [
  { href: '/portfolio?cat=wedding', label: 'Wedding', icon: Gem },
  { href: '/portfolio?cat=portraits', label: 'Portraits', icon: User },
  { href: '/portfolio?cat=events', label: 'Events', icon: CalendarCheck },
  { href: '/portfolio?cat=fashion', label: 'Fashion', icon: Shirt },
  { href: '/portfolio?cat=product', label: 'Product', icon: Package },
  { href: '/portfolio?cat=nature', label: 'Nature', icon: TreePine },
];

export default async function HomePage() {
  const settings = await getPublicSettings();
  const [portfolioResult, packagesResult, testimonialsResult] = await Promise.all([
    getPublicPortfolioItems(),
    getPackages(),
    getTestimonials(),
  ]);

  // Resilience policy: on a REAL database failure the homepage falls back to
  // the demo collections it always used (the site stays presentable during an
  // outage). On a successful-but-empty result (nothing published yet) the
  // section is hidden instead of showing fake/demo records.
  const portfolioItems = portfolioResult.error ? defaultPortfolioItems : portfolioResult.data;
  const packages = packagesResult.error ? defaultPackages : packagesResult.data;
  const testimonials = testimonialsResult.error ? defaultTestimonials : testimonialsResult.data;
  const showPortfolioSection = portfolioItems.length > 0;
  const showPackagesSection = packages.length > 0;
  const showTestimonialsSection = testimonials.length > 0;

  // Hero values come straight from the server-rendered settings — the hero no
  // longer waits on a client API round-trip before rendering the video URL.
  const heroTitle = settings.heroTitle || 'CAPTURING TIME, CRAFTING MEMORIES';
  const heroSubhead = settings.heroSubhead || 'Premier Photography & Videography Studio based in Addis Ababa, Ethiopia.';
  const heroVideoUrl = settings.heroVideoUrl || '/background.mp4';
  const ctaPrimaryText = settings.ctaPrimaryText || 'BOOK A SESSION';
  const ctaSecondaryText = settings.ctaSecondaryText || 'VIEW PORTFOLIO';
  const heroPoster = portfolioItems.find((item) => item.type === 'image')?.src || '/images/wedding-1.jpg';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <PublicNav settings={settings} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full">
        {/* HERO SECTION WITH DYNAMIC PROPS */}
        <HeroSection
          videoUrl={heroVideoUrl}
          posterUrl={heroPoster}
          titleLine1={heroTitle}
          titleLine2=""
          tagline={heroSubhead}
          ctaPrimaryText={ctaPrimaryText}
          ctaSecondaryText={ctaSecondaryText}
        />

        {/* CATEGORIES BAR */}
        <section className="my-12 border-t border-[#e8d8d8] pt-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categoryLinks.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="flex flex-col items-center justify-center p-4 bg-[#f4e8ea] hover:bg-[#e6d4d6] rounded-2xl text-xs md:text-sm font-semibold uppercase text-[#2e2a2a] tracking-wider transition-all duration-200"
                >
                  <Icon className="w-7 h-7 text-[#6a1b2a] mb-2" strokeWidth={1.75} />
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FEATURED PORTFOLIO SECTION */}
        {showPortfolioSection && (
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

          <PortfolioGrid items={portfolioItems} priorityCount={4} />
        </section>
        )}

        {/* FEATURED PACKAGES SECTION */}
        {showPackagesSection && (
        <section className="my-20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#1e1a1c] mb-3">
            CHOOSE YOUR PERFECT PACKAGE · <strong className="font-semibold text-[#6a1b2a]">Packages That Fit Every Moment</strong>
          </h2>
          <p className="text-sm text-[#5a4a4a] max-w-xl mx-auto mb-12">
            Transparent ETB pricing for sessions, events, and complete wedding coverage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {packages.map((pkg: any) => (
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
        )}

        {/* TESTIMONIALS SECTION */}
        {showTestimonialsSection && (
        <section className="my-20 bg-[#f4e8ea] rounded-[40px] p-8 sm:p-12 md:p-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-center text-[#1e1a1c] mb-12">
            <strong className="font-semibold text-[#6a1b2a]">KIND WORDS</strong> · What Our Clients Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t: any, idx: number) => (
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
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
