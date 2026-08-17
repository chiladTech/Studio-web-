'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Instagram, Send, Facebook, Youtube, MapPin, Phone, Mail, Heart, CheckCircle2, Globe } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<any>({
    studioName: 'MAYA PICTURES',
    contactEmail: 'contact@mayapictures.com',
    contactPhone: '+251 911 234 567',
    address: 'Bole Road, Mega Tower, 4th Floor, Addis Ababa, Ethiopia',
  });
  const [socialLinks, setSocialLinks] = useState<any[]>([
    { id: '1', platform: 'Instagram', url: 'https://instagram.com/mayapictures' },
    { id: '2', platform: 'Telegram', url: 'https://t.me/mayapictures' },
    { id: '3', platform: 'YouTube', url: 'https://youtube.com/@mayapictures' },
  ]);

  useEffect(() => {
    async function loadFooterSettings() {
      try {
        const res = await fetch('/api/v1/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            const { socialLinks: loadedSocials, ...rest } = data.data;
            setSettings((prev: any) => ({ ...prev, ...rest }));
            if (Array.isArray(loadedSocials)) {
              setSocialLinks(loadedSocials);
            } else if (typeof loadedSocials === 'string') {
              try { setSocialLinks(JSON.parse(loadedSocials)); } catch (e) {}
            }
          }
        }
      } catch (e) {}
    }
    loadFooterSettings();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#fcf9f6] border-t border-[#6a1b2a]/15 pt-12 pb-6 text-[#1e1a1c]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        {/* Instagram / Social Strip */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#e0d0d0] pb-6 mb-10 gap-4">
          <div className="flex items-center gap-3 text-lg md:text-xl font-normal tracking-wide">
            <Instagram className="w-6 h-6 text-[#6a1b2a]" />
            <span className="font-semibold text-[#6a1b2a]">@{settings.studioName?.toLowerCase().replace(/\s+/g, '')}</span>
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
              {settings.studioName || 'MAYA PICTURES'}
            </h4>
            <p className="text-xs md:text-sm text-[#3a2a2a] leading-relaxed">
              Capturing real moments and creating timeless memories. Let&apos;s tell your story through our editorial lens.
            </p>
            <div className="space-y-2 text-xs md:text-sm text-[#3a2a2a] pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                <span>{settings.contactPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6a1b2a] shrink-0" />
                <span>{settings.contactEmail}</span>
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

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase text-[#6a1b2a] mb-4">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-[#3a2a2a]">
              <li>
                <Link href="/about" className="hover:text-[#6a1b2a] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-[#6a1b2a] transition-colors">
                  Portfolio Gallery
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-[#6a1b2a] transition-colors">
                  Packages & Pricing
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-[#6a1b2a] transition-colors">
                  Stories & Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#6a1b2a] transition-colors">
                  Contact Studio
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#6a1b2a] transition-colors text-xs opacity-75">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase text-[#6a1b2a] mb-4">
              SERVICES
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-[#3a2a2a]">
              <li>
                <Link href="/services" className="hover:text-[#6a1b2a] transition-colors">
                  Wedding Photography
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#6a1b2a] transition-colors">
                  Portrait Photography
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#6a1b2a] transition-colors">
                  Event Photography
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#6a1b2a] transition-colors">
                  Fashion Photography
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#6a1b2a] transition-colors">
                  Product Photography
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#6a1b2a] transition-colors">
                  Nature & Commercial
                </Link>
              </li>
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
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6a1b2a] bg-[#f4e8ea] p-3 rounded-full border border-[#6a1b2a]/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#5a4a4a] gap-4">
          <div className="flex items-center gap-1">
            <span>© 2026 {settings.studioName || 'MAYA PICTURES'}. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/faq" className="hover:text-[#6a1b2a] transition-colors">
              FAQ
            </Link>
            <Link href="/privacy" className="hover:text-[#6a1b2a] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#6a1b2a] transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
