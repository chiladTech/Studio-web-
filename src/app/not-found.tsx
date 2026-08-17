'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Camera } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcf9f6] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#f4e8ea] mb-6">
          <Camera className="w-10 h-10 text-[#6a1b2a]" />
        </div>
        <h1 className="text-8xl font-extralight text-[#6a1b2a] mb-3">404</h1>
        <h2 className="text-2xl font-light text-[#1e1a1c] mb-4">Page Not Found</h2>
        <p className="text-sm text-[#5a4a4a] leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved, renamed, or never created.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#6a1b2a] text-white hover:bg-[#8f2a3e] px-8 py-3.5 rounded-full font-semibold text-xs tracking-widest uppercase transition-all shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>BACK TO MAYA PICTURES</span>
        </Link>
      </div>
    </div>
  );
}
