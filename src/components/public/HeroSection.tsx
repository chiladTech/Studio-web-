import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Award } from 'lucide-react';
import SmartHeroVideo from './SmartHeroVideo';

interface HeroSectionProps {
  videoUrl?: string;
  posterUrl?: string;
  eyebrow?: string;
  titleLine1?: string;
  titleLine2?: string;
  tagline?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
  experienceBadge?: string;
}

export default function HeroSection({
  videoUrl = '/background.mp4',
  posterUrl = '/images/wedding-1.jpg',
  eyebrow = 'Capturing Moments, Creating Stories',
  titleLine1 = "WE DON'T JUST TAKE PHOTOS",
  titleLine2 = 'We Capture Emotions.',
  tagline = 'You Live Them. Professional photography for all your special moments.',
  ctaPrimaryText = 'BOOK A SESSION',
  ctaSecondaryText = 'VIEW PORTFOLIO',
  experienceBadge = '10+ YEARS OF EXPERIENCE',
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] my-6 rounded-2xl md:rounded-3xl overflow-hidden flex items-center justify-center text-center shadow-xl">
      {/* Poster image — renders immediately in the server HTML; doubles as the
          fallback if the video is disabled (mobile/data-saver) or fails. */}
      <Image
        src={posterUrl}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover z-0"
      />

      {/* Background Video — only rendered after the client confirms the device
          should download video (desktop, no reduced-motion/data preference). */}
      <SmartHeroVideo videoUrl={videoUrl} />

      {/* Hero Overlay */}
      <div className="absolute inset-0 bg-black/55 z-10 backdrop-brightness-95" />

      {/* Hero Central Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 py-16 text-white flex flex-col items-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 text-xs md:text-sm tracking-[4px] uppercase text-white/90 font-light mb-5 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <Camera className="w-4 h-4 text-[#b8865a]" />
          <span>{eyebrow}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-tight leading-[1.15] mb-4 text-white uppercase">
          {titleLine1}
          {titleLine2 && (
            <>
              <br />
              <strong className="font-semibold text-white">{titleLine2}</strong>
            </>
          )}
        </h1>

        {/* Supporting Tagline */}
        <p className="text-base sm:text-xl font-light text-white/90 max-w-2xl mb-8 leading-relaxed">
          {tagline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/book"
            className="bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-8 py-3.5 rounded-full font-medium text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105 shadow-lg"
          >
            {ctaPrimaryText}
          </Link>
          <Link
            href="/portfolio"
            className="bg-transparent border-2 border-white hover:bg-white hover:text-[#1e1a1c] text-white px-8 py-3.5 rounded-full font-medium text-xs sm:text-sm tracking-widest uppercase transition-all duration-300"
          >
            {ctaSecondaryText}
          </Link>
        </div>

        {/* Experience Trust Badge */}
        <div className="mt-10 inline-flex items-center gap-2.5 text-xs sm:text-sm tracking-wider uppercase text-white/90 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/15">
          <Award className="w-5 h-5 text-[#b8865a]" />
          <span>{experienceBadge}</span>
        </div>
      </div>

      {/* Inline keyframe for video fade-in animation */}
      <style>{`
        @keyframes fadeInVideo {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
