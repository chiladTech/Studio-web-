'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fcf9f6] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white border border-[#6a1b2a]/20 rounded-3xl p-8 md:p-10 shadow-xl">
        <div className="w-16 h-16 bg-[#f4e8ea] text-[#6a1b2a] rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#1e1a1c] mb-2">Something went wrong</h2>
        <p className="text-sm text-[#4a3a3a] mb-6 leading-relaxed">
          We encountered an unexpected error while loading this page. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-5 py-2.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-[#1e1a1c] px-5 py-2.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all"
          >
            <Home className="w-4 h-4" />
            <span>HOMEPAGE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
