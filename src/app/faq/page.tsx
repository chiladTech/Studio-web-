'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/public/Header';
import MobileMenu from '@/components/public/MobileMenu';
import Footer from '@/components/public/Footer';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<any[]>([]);

  const defaultFaqs = [
    { question: 'How do I book a photography session with Maya Pictures?', answer: 'You can easily request a session online by clicking "BOOK A SESSION" on our website or visiting our Booking page. Select your desired service, package, and preferred date. Our team will review details and confirm availability.' },
    { question: 'How quickly will I receive my edited photos and video reels?', answer: 'Standard portrait sessions are delivered within 3-5 business days. Full event and wedding packages are delivered within 2-3 weeks via a password-protected online gallery.' },
    { question: 'What payment currency and methods do you accept?', answer: 'All our package pricing is listed in ETB (Ethiopian Birr). We accept local bank transfers, mobile money, and direct cash payments at our studio.' },
    { question: 'Can we customize a package for our wedding or event?', answer: 'Absolutely! We understand every ceremony is unique. We offer custom quotes that combine photo albums, drone videography, behind-the-scenes reels, and extra coverage hours.' },
    { question: 'Do you travel outside Addis Ababa for photoshoots?', answer: 'Yes! Our photography team is available for destination weddings, commercial shoots, and outdoor nature sessions across all regions of Ethiopia.' },
  ];

  useEffect(() => {
    async function loadDynamicFaqs() {
      try {
        const res = await fetch('/api/v1/faq');
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            setFaqs(data.data);
            return;
          }
        }
      } catch (e) {}
      setFaqs(defaultFaqs);
    }
    loadDynamicFaqs();
  }, []);

  const displayList = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#6a1b2a] uppercase bg-[#f4e8ea] px-4 py-1.5 rounded-full mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>GOT QUESTIONS?</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1e1a1c]">
            Frequently Asked <strong className="font-semibold text-[#6a1b2a]">Questions</strong>
          </h1>
          <p className="text-sm md:text-base text-[#4a3a3a] mt-3 leading-relaxed">
            Everything you need to know about booking, delivery timelines, pricing packages, and session preparation.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {displayList.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || idx}
                className="bg-white rounded-2xl border border-[#ece0e0] shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-medium text-base text-[#1e1a1c] hover:text-[#6a1b2a] transition-colors"
                >
                  <span>{faq.question || faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#6a1b2a] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-[#4a3a3a] leading-relaxed border-t border-gray-100 bg-[#fcf9f6]/50">
                    {faq.answer || faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
