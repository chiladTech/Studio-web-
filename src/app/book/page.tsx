'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/public/Header';
import MobileMenu from '@/components/public/MobileMenu';
import BookingForm from '@/components/public/BookingForm';
import Footer from '@/components/public/Footer';
import { Calendar } from 'lucide-react';

function BookingContent() {
  const searchParams = useSearchParams();
  const initialPackage = searchParams.get('package') || '';
  const initialService = searchParams.get('service') || '';

  return <BookingForm initialPackage={initialPackage} initialService={initialService} />;
}

export default function BookPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#6a1b2a] uppercase bg-[#f4e8ea] px-4 py-1.5 rounded-full mb-3">
            <Calendar className="w-4 h-4" />
            <span>SESSION RESERVATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1e1a1c]">
            Book a <strong className="font-semibold text-[#6a1b2a]">Session</strong>
          </h1>
          <p className="text-sm md:text-base text-[#4a3a3a] mt-3 leading-relaxed">
            Fill out your details below to submit a session booking request. Our team will verify dates and contact you with confirmation.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12">Loading booking form...</div>}>
          <BookingContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
