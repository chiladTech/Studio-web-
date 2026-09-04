'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

interface FaqListProps {
  faqs: FaqItem[];
}

export default function FaqList({ faqs }: FaqListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, idx) => {
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
              <span>{faq.question}</span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-[#6a1b2a] shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="px-6 pb-6 pt-2 text-sm text-[#4a3a3a] leading-relaxed border-t border-gray-100 bg-[#fcf9f6]/50">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
