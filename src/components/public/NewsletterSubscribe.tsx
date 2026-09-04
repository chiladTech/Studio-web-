'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-[#6a1b2a] bg-[#f4e8ea] p-3 rounded-full border border-[#6a1b2a]/20">
        <CheckCircle2 className="w-4 h-4" />
        <span>Thank you for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full px-4 py-2.5 rounded-full border border-gray-300 focus:border-[#6a1b2a] outline-none text-xs bg-white"
      />
      <button
        type="submit"
        className="bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all"
      >
        SUBSCRIBE
      </button>
    </form>
  );
}
