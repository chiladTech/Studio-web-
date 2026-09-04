'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Calendar } from 'lucide-react';

interface NavLinkItem {
  id?: string;
  label: string;
  href: string;
}

const DEFAULT_NAV: NavLinkItem[] = [
  { label: 'HOME', href: '/' },
  { label: 'ABOUT', href: '/about' },
  { label: 'SERVICES', href: '/services' },
  { label: 'PORTFOLIO', href: '/portfolio' },
  { label: 'PACKAGES', href: '/packages' },
  { label: 'STORIES', href: '/stories' },
  { label: 'FAQ', href: '/faq' },
  { label: 'CONTACT', href: '/contact' },
];

interface HeaderProps {
  onOpenMobileMenu: () => void;
  /** Flat map of WebsiteSetting values (fetched once server-side, never per-client). */
  settings?: Record<string, any>;
}

export default function Header({ onOpenMobileMenu, settings }: HeaderProps) {
  const pathname = usePathname();

  const navLinks: NavLinkItem[] =
    Array.isArray(settings?.navLinks) && settings.navLinks.length > 0 ? settings.navLinks : DEFAULT_NAV;
  const logoUrl = settings?.logoUrl !== undefined ? settings.logoUrl : '/my-logo.png';
  const headerCtaText = settings?.headerCtaText || 'BOOK A SESSION';
  const headerCtaLink = settings?.headerCtaLink || '/book';
  const headerCtaVisible = typeof settings?.headerCtaVisible === 'boolean' ? settings.headerCtaVisible : true;
  const studioName = settings?.studioName || 'MAYA PICTURES';

  return (
    <header className="w-full bg-[#fcf9f6] border-b border-[#6a1b2a]/15 sticky top-0 z-50 transition-all">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        {/* Brand Logo or Brand Name */}
        <Link href="/" className="flex items-center group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Maya Pictures Logo"
              className="h-[50px] md:h-[58px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-xl md:text-2xl font-bold tracking-wider text-[#6a1b2a] uppercase group-hover:text-[#8f2a3e] transition-colors">
              {studioName}
            </span>
          )}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium tracking-[0.8px] uppercase text-[#2a2a2a]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.id || link.href}
                href={link.href}
                className={`transition-colors hover:text-[#6a1b2a] pb-1 ${
                  isActive
                    ? 'text-[#6a1b2a] border-b-2 border-[#6a1b2a] font-semibold'
                    : 'text-[#2a2a2a]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Extra Action Buttons */}
        <div className="flex items-center gap-4">
          {headerCtaVisible && (
            <Link
              href={headerCtaLink || '/book'}
              className="hidden sm:inline-flex items-center gap-2 bg-[#6a1b2a] text-white hover:bg-transparent hover:text-[#6a1b2a] border border-[#6a1b2a] px-6 py-2 rounded-full font-medium text-[13px] tracking-[0.8px] transition-all duration-250 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>{headerCtaText || 'BOOK A SESSION'}</span>
            </Link>
          )}

          {/* Mobile Hamburger Trigger */}
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open Mobile Menu"
            className="lg:hidden p-2 text-[#6a1b2a] hover:bg-[#f4e8ea] rounded-full transition-colors"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>
    </header>
  );
}
