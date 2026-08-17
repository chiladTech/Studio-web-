'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import MobileMenu from '@/components/public/MobileMenu';
import BookingForm from '@/components/public/BookingForm';
import Footer from '@/components/public/Footer';
import { Mail, Phone, MapPin, Clock, Calendar } from 'lucide-react';

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#6a1b2a] uppercase bg-[#f4e8ea] px-4 py-1.5 rounded-full mb-3">
            <Mail className="w-4 h-4" />
            <span>CONNECT WITH US</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1e1a1c]">
            Get in <strong className="font-semibold text-[#6a1b2a]">Touch</strong>
          </h1>
          <p className="text-sm md:text-base text-[#4a3a3a] mt-3 leading-relaxed">
            We&apos;d love to hear about your project or upcoming celebration. Reach out or book your session directly below.
          </p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white p-8 rounded-3xl border border-[#ece0e0] shadow-sm space-y-4">
            <h3 className="text-xl font-semibold text-[#6a1b2a] flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span>Studio Contact</span>
            </h3>
            <div className="space-y-3 text-sm text-[#3a2a2a] pt-2">
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                <span>hello@mayapictures.com</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                <span>(+251) 913222709</span>
              </p>
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#6a1b2a] shrink-0 mt-0.5" />
                <span>123 GONDAR PIASSA NEAR, BEJIROND CAFE</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#ece0e0] shadow-sm space-y-4">
            <h3 className="text-xl font-semibold text-[#6a1b2a] flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Studio Hours</span>
            </h3>
            <div className="space-y-2 text-sm text-[#3a2a2a] pt-2">
              <p>Monday – Friday: 9:00 AM – 6:00 PM</p>
              <p>Saturday: 10:00 AM – 4:00 PM</p>
              <p>Sunday: Closed (On-location sessions only)</p>
            </div>
            <div className="pt-2">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-[#6a1b2a] text-white hover:bg-[#8f2a3e] px-6 py-2.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>BOOK A SESSION</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-light text-[#1e1a1c]">
              Send an <strong className="font-semibold text-[#6a1b2a]">Inquiry Request</strong>
            </h2>
          </div>
          <BookingForm />
        </section>
      </main>

      <Footer />
    </div>
  );
}
