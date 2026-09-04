import React from 'react';
import PublicNav from '@/components/public/PublicNav';
import Footer from '@/components/public/Footer';
import FaqList, { FaqItem } from '@/components/public/FaqList';
import { getPublicSettings, getFaqs } from '@/lib/site-data';
import EmptyState from '@/components/public/EmptyState';
import { HelpCircle } from 'lucide-react';

export const revalidate = 60;

const defaultFaqs: FaqItem[] = [
  { question: 'How do I book a photography session with Maya Pictures?', answer: 'You can easily request a session online by clicking "BOOK A SESSION" on our website or visiting our Booking page. Select your desired service, package, and preferred date. Our team will review details and confirm availability.' },
  { question: 'How quickly will I receive my edited photos and video reels?', answer: 'Standard portrait sessions are delivered within 3-5 business days. Full event and wedding packages are delivered within 2-3 weeks via a password-protected online gallery.' },
  { question: 'What payment currency and methods do you accept?', answer: 'All our package pricing is listed in ETB (Ethiopian Birr). We accept local bank transfers, mobile money, and direct cash payments at our studio.' },
  { question: 'Can we customize a package for our wedding or event?', answer: 'Absolutely! We understand every ceremony is unique. We offer custom quotes that combine photo albums, drone videography, behind-the-scenes reels, and extra coverage hours.' },
  { question: 'Do you travel outside Addis Ababa for photoshoots?', answer: 'Yes! Our photography team is available for destination weddings, commercial shoots, and outdoor nature sessions across all regions of Ethiopia.' },
];

export default async function FAQPage() {
  const settings = await getPublicSettings();
  const faqsResult = await getFaqs();
  const showEmptyState = !faqsResult.error && faqsResult.data.length === 0;

  const displayList: FaqItem[] = faqsResult.error
    ? defaultFaqs
    : faqsResult.data.map((faq: any) => ({ id: faq.id, question: faq.question, answer: faq.answer }));

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <PublicNav settings={settings} />

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

        {showEmptyState ? (
          <EmptyState
            icon={<HelpCircle className="w-6 h-6 text-[#6a1b2a]" />}
            title="No frequently asked questions available."
            message="Check back soon — answers will appear here once published."
          />
        ) : (
          <FaqList faqs={displayList} />
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
