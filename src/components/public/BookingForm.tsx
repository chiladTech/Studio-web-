'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookingFormProps {
  initialPackage?: string;
  initialService?: string;
}

export default function BookingForm({ initialPackage = '', initialService = '' }: BookingFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    contactMethod: 'email',
    service: initialService || 'Wedding Photography',
    package: initialPackage || 'Standard Package',
    preferredDate: '',
    location: '',
    budget: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const servicesList = [
    'Wedding Photography',
    'Portrait Photography',
    'Event Photography',
    'Fashion Photography',
    'Product Photography',
    'Nature Photography',
    'Commercial Videography',
  ];

  const packagesList = [
    'Beauty (2,000 ETB +)',
    'Standard (10,000 - 15,000 ETB +)',
    'Premium (80,000 ETB +)',
    'Custom Session Quote',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSuccessData(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-[#f4e8ea] border-2 border-[#6a1b2a] rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto my-8 animate-fade-in shadow-xl">
        <CheckCircle2 className="w-16 h-16 text-[#6a1b2a] mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-light text-[#1e1a1c] mb-2">
          Inquiry <strong className="font-semibold text-[#6a1b2a]">Submitted Successfully!</strong>
        </h2>
        <p className="text-[#4a3a3a] text-sm md:text-base mb-6">
          Thank you, <strong className="text-[#1e1a1c]">{successData.fullName}</strong>. Your inquiry reference number is:
        </p>
        <div className="inline-block bg-white text-[#6a1b2a] font-mono text-lg font-bold px-6 py-3 rounded-full border border-[#6a1b2a]/20 mb-6 shadow-inner">
          {successData.inquiryNumber}
        </div>
        <p className="text-xs text-[#6a5a5a] max-w-md mx-auto mb-8">
          Our team at Maya Pictures will review your session details and reach out to you within 24 hours via {successData.contactMethod}.
        </p>
        <button
          onClick={() => setSuccessData(null)}
          className="bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white px-8 py-3 rounded-full font-semibold text-xs tracking-widest uppercase transition-all shadow-md"
        >
          SUBMIT ANOTHER REQUEST
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 border border-[#ece0e0] shadow-sm max-w-3xl mx-auto my-6 space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Abebe Bikila"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. abebe@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. (+251) 913222709"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
            Preferred Contact Method
          </label>
          <select
            name="contactMethod"
            value={formData.contactMethod}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all bg-white"
          >
            <option value="email">Email</option>
            <option value="phone">Phone / WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
            Photography Service
          </label>
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all bg-white"
          >
            {servicesList.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
            Package Selection
          </label>
          <select
            name="package"
            value={formData.package}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all bg-white"
          >
            {packagesList.map((pkg) => (
              <option key={pkg} value={pkg}>
                {pkg}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
            Preferred Date
          </label>
          <input
            type="date"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
            Location / Venue
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Gondar Piassa / Addis Ababa"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6a1b2a] mb-2">
          Project Details / Special Requests *
        </label>
        <textarea
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your event, style preferences, number of guests, or vision..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6a1b2a] focus:ring-2 focus:ring-[#6a1b2a]/10 outline-none text-sm transition-all resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-full bg-[#6a1b2a] hover:bg-[#8f2a3e] text-white font-semibold text-xs tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <span>SUBMITTING INQUIRY...</span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>SUBMIT BOOKING REQUEST</span>
          </>
        )}
      </button>
    </form>
  );
}
