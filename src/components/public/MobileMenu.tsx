'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, Info, Camera, Images, Tags, BookOpen, HelpCircle, Mail, Calendar, Instagram, Send, Facebook, Youtube } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState<string>('/my-logo.png');
  const [headerCtaText, setHeaderCtaText] = useState<string>('BOOK A SESSION');
  const [headerCtaLink, setHeaderCtaLink] = useState<string>('/book');
  const [studioName, setStudioName] = useState<string>('MAYA PICTURES');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/v1/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            if (data.data.logoUrl !== undefined) setLogoUrl(data.data.logoUrl);
            if (data.data.headerCtaText) setHeaderCtaText(data.data.headerCtaText);
            if (data.data.headerCtaLink) setHeaderCtaLink(data.data.headerCtaLink);
            if (data.data.studioName) setStudioName(data.data.studioName);
          }
        }
      } catch {}
    }
    loadSettings();
  }, []);

  if (!isOpen) return null;

  const mobileNavLinks = [
    { label: 'HOME', href: '/', icon: Home },
    { label: 'ABOUT', href: '/about', icon: Info },
    { label: 'SERVICES', href: '/services', icon: Camera },
    { label: 'PORTFOLIO', href: '/portfolio', icon: Images },
    { label: 'PACKAGES', href: '/packages', icon: Tags },
    { label: 'STORIES', href: '/stories', icon: BookOpen },
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
    { label: 'CONTACT', href: '/contact', icon: Mail },
  ];

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-[98] backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Slide-in Drawer */}
      <div className="fixed top-0 right-0 w-[300px] sm:w-[340px] h-full bg-white z-[99] p-8 flex flex-col justify-between shadow-2xl overflow-y-auto transition-transform duration-300">
        <div>
          {/* Header & Close Button */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            {logoUrl ? (
              <img src={logoUrl} alt="Maya Pictures Logo" className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-lg font-bold tracking-wider text-[#6a1b2a] uppercase">
                {studioName}
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Close Menu"
              className="p-2 text-[#6a1b2a] hover:rotate-90 transition-transform duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {mobileNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-medium tracking-wide uppercase transition-all ${
                    isActive
                      ? 'bg-[#6a1b2a] text-white'
                      : 'text-[#2a2a2a] hover:bg-[#f4e8ea] hover:text-[#6a1b2a]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#6a1b2a]'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Booking CTA Button */}
          <Link
            href={headerCtaLink || '/book'}
            onClick={onClose}
            className="flex items-center justify-center gap-2 mt-8 bg-[#6a1b2a] text-white hover:bg-transparent hover:text-[#6a1b2a] border border-[#6a1b2a] w-full py-4 rounded-full font-semibold text-sm tracking-wider uppercase transition-all shadow-md"
          >
            <Calendar className="w-5 h-5" />
            <span>{headerCtaText || 'BOOK A SESSION'}</span>
          </Link>
        </div>

        {/* Social Networks Footer */}
        <div className="pt-6 border-t border-gray-100 flex justify-center gap-3">
          <a
            href="https://instagram.com/mayapictures2127"
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-[#f4e8ea] text-[#6a1b2a] hover:bg-[#6a1b2a] hover:text-white flex items-center justify-center transition-all hover:-translate-y-1"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://t.me/mayappicturest"
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-[#f4e8ea] text-[#6a1b2a] hover:bg-[#6a1b2a] hover:text-white flex items-center justify-center transition-all hover:-translate-y-1"
          >
            <Send className="w-5 h-5" />
          </a>
          <a
            href="https://facebook.com/mayapicture"
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-[#f4e8ea] text-[#6a1b2a] hover:bg-[#6a1b2a] hover:text-white flex items-center justify-center transition-all hover:-translate-y-1"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://youtube.com/@mayapicture"
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-[#f4e8ea] text-[#6a1b2a] hover:bg-[#6a1b2a] hover:text-white flex items-center justify-center transition-all hover:-translate-y-1"
          >
            <Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>
    </>
  );
}
