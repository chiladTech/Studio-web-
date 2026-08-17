'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Calendar } from 'lucide-react';

interface PackageCardProps {
  name: string;
  priceDisplay: string;
  description: string;
  duration?: string;
  deliverables?: string;
  isFeatured?: boolean;
}

export default function PackageCard({
  name,
  priceDisplay,
  description,
  duration,
  deliverables,
  isFeatured = false,
}: PackageCardProps) {
  const deliverableItems = deliverables ? deliverables.split(',').map((item) => item.trim()) : [];

  return (
    <div
      className={`relative bg-white rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 ${
        isFeatured
          ? 'border-[#6a1b2a] shadow-xl ring-2 ring-[#6a1b2a]/10 scale-[1.02]'
          : 'border-[#ece0e0] shadow-sm hover:border-[#6a1b2a]'
      }`}
    >
      {isFeatured && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6a1b2a] text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1 rounded-full shadow-md">
          Most Popular
        </span>
      )}

      <div>
        <h3 className="text-lg font-bold tracking-widest uppercase text-[#6a1b2a] mb-2">{name}</h3>
        <div className="text-3xl md:text-4xl font-light text-[#1e1a1c] mb-3">
          {priceDisplay}
        </div>
        <p className="text-sm text-[#4a3a3a] mb-6 leading-relaxed">{description}</p>

        {duration && (
          <div className="text-xs font-semibold text-[#b8865a] uppercase tracking-wider mb-4 border-b border-gray-100 pb-3">
            Duration: {duration}
          </div>
        )}

        {deliverableItems.length > 0 && (
          <ul className="space-y-2.5 mb-8 text-xs sm:text-sm text-[#2a2a2a]">
            {deliverableItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#6a1b2a] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/book?package=${encodeURIComponent(name)}`}
        className={`w-full py-3.5 rounded-full font-semibold text-xs tracking-widest uppercase text-center transition-all duration-250 flex items-center justify-center gap-2 ${
          isFeatured
            ? 'bg-[#6a1b2a] text-white hover:bg-[#8f2a3e] shadow-md'
            : 'bg-transparent border-2 border-[#6a1b2a] text-[#6a1b2a] hover:bg-[#6a1b2a] hover:text-white'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span>BOOK NOW</span>
      </Link>
    </div>
  );
}
