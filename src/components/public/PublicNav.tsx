'use client';

import React, { useState } from 'react';
import Header from './Header';
import MobileMenu from './MobileMenu';

interface PublicNavProps {
  /** Flat map of WebsiteSetting values fetched once by the (server) page. */
  settings?: Record<string, any>;
}

/**
 * Shared client header + mobile menu for public pages.
 * Holds only the mobile-menu open state — all content arrives server-rendered.
 */
export default function PublicNav({ settings }: PublicNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} settings={settings} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} settings={settings} />
    </>
  );
}
