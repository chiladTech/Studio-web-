import React from 'react';
import Link from 'next/link';
import { Instagram, MapPin, Phone, Mail, Globe } from 'lucide-react';
import NewsletterSubscribe from './NewsletterSubscribe';

interface LinkItem {
  id: string;
  label: string;
  href: string;
}

const DEFAULT_FOOTER_QUICK: LinkItem[] = [
  { id: 'q1', label: 'About Us', href: '/about' },
  { id: 'q2', label: 'Portfolio Gallery', href: '/portfolio' },
  { id: 'q3', label: 'Packages & Pricing', href: '/packages' },
  { id: 'q4', label: 'Stories & Blog', href: '/stories' },
  { id: 'q5', label: 'Contact Studio', href: '/contact' },
];

const DEFAULT_FOOTER_SERVICES: LinkItem[] = [
  { id: 's1', label: 'Wedding Photography', href: '/services' },
  { id: 's2', label: 'Portrait Photography', href: '/services' },
  { id: 's3', label: 'Event Photography', href: '/services' },
  { id: 's4', label: 'Fashion Photography', href: '/services' },
  { id: 's5', label: 'Product Photography', href: '/services' },
  { id: 's6', label: 'Nature & Commercial', href: '/services' },
];

const DEFAULT_FOOTER_LEGAL: LinkItem[] = [
  { id: 'l1', label: 'FAQ', href: '/faq' },
  { id: 'l2', label: 'Privacy Policy', href: '/privacy' },
  { id: 'l3', label: 'Terms & Conditions', href: '/terms' },
];

const DEFAULT_FOOTER_BRAND = {
  studioName: 'MAYA PICTURES',
  contactEmail: 'contact@mayapictures.com',
  contactPhone: '+251 911 234 567',
  address: 'Bole Road, Mega Tower, 4th Floor, Addis Ababa, Ethiopia',
};

interface FooterProps {
  /** Flat map of WebsiteSetting values fetched once server-side. */
  settings?: Record<string, any>;
}

export default function Footer({ settings }: FooterProps) {
  const brand = {
    studioName: settings?.studioName || DEFAULT_FOOTER_BRAND.studioName,
    contactEmail: settings?.contactEmail || DEFAULT_FOOTER_BRAND.contactEmail,
    contactPhone: settings?.contactPhone || DEFAULT_FOOTER_BRAND.contactPhone,
    address: settings?.address || DEFAULT_FOOTER_BRAND.address,
  };

  const socialLinks: any[] = Array.isArray(settings?.socialLinks) && settings.socialLinks.length > 0
    ? settings.socialLinks
    : [
        { id: '1', platform: 'Instagram', url: 'https://instagram.com/mayapictures' },
        { id: '2', platform: 'Telegram', url: 'https://t.me/mayapictures' },
        { id: '3', platform: 'YouTube', url: 'https://youtube.com/@mayapictures' },
      ];

  const footerQuick: LinkItem[] =
    Array.isArray(settings?.footerQuick) && settings.footerQuick.length > 0 ? settings.footerQuick : DEFAULT_FOOTER_QUICK;
  const footerServices: LinkItem[] =
    Array.isArray(settings?.footerServices) && settings.footerServices.length > 0 ? settings.footerServices : DEFAULT_FOOTER_SERVICES;
  const footerLegal: LinkItem[] =
    Array.isArray(settings?.footerLegal) && settings.footerLegal.length > 0 ? settings.footerLegal : DEFAULT_FOOTER_LEGAL;

  return (
    <footer className="w-full bg-[#fcf9f6] border-t border-[#6a1b2a]/15 pt-12 pb-6 text-[#1e1a1c]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        {/* Instagram / Social Strip */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#e0d0d0] pb-6 mb-10 gap-4">
          <div className="flex items-center gap-3 text-lg md:text-xl font-normal tracking-wide">
            <Instagram className="w-6 h-6 text-[#6a1b2a]" />
            <span className="font-semibold text-[#6a1b2a]">@{brand.studioName?.toLowerCase().replace(/\s+/g, '')}</span>
          </div>
          <a
            href={socialLinks[0]?.url || 'https://instagram.com'}
            target="_blank"
            rel="noreferrer"
            className="text-xs md:text-sm font-semibold tracking-wider text-[#6a1b2a] hover:underline uppercase"
          >
            FOLLOW US ONLINE →
          </a>
        </div>

        {/* Footer Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-[#e0d0d0]">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm tracking-widest uppercase text-[#6a1b2a]">
              {brand.studioName || 'MAYA PICTURES'}
            </h4>
            <p className="text-xs md:text-sm text-[#3a2a2a] leading-relaxed">
              Capturing real moments and creating timeless memories. Let&apos;s tell your story through our editorial lens.
            </p>
            <div className="space-y-2 text-xs md:text-sm text-[#3a2a2a] pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                <span>{brand.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                <span>{brand.contactPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                <span>{brand.contactEmail}</span>
              </p>
            </div>

            {/* Dynamic Social Links */}
            <div className="flex flex-wrap gap-2.5 pt-4">
              {socialLinks.map((item, idx) => (
                <a
                  key={item.id || idx}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-full bg-[#f4e8ea] text-[#6a1b2a] hover:bg-[#6a1b2a] hover:text-white text-xs font-bold transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shadow-sm"
                  aria-label={item.platform}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{item.platform}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Dynamic Quick Links */}
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase text-[#6a1b2a] mb-4">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-[#3a2a2a]">
              {footerQuick.map((link) => (
                <li key={link.id || link.href}>
                  <Link href={link.href} className="hover:text-[#6a1b2a] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Dynamic Services Links */}
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase text-[#6a1b2a] mb-4">
              SERVICES
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-[#3a2a2a]">
              {footerServices.map((link) => (
                <li key={link.id || link.href}>
                  <Link href={link.href} className="hover:text-[#6a1b2a] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase text-[#6a1b2a] mb-4">
              NEWSLETTER
            </h4>
            <p className="text-xs md:text-sm text-[#3a2a2a] mb-4 leading-relaxed">
              Subscribe to get exclusive photography updates and seasonal offers.
            </p>
            <NewsletterSubscribe />
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#5a4a4a] gap-4">
          <div className="flex items-center gap-1">
            <span>© 2026 {brand.studioName || 'MAYA PICTURES'}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            {footerLegal.map((link) => (
              <Link key={link.id || link.href} href={link.href} className="hover:text-[#6a1b2a] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
