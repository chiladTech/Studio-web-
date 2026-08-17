'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Images,
  FolderTree,
  Film,
  Camera,
  Tags,
  BookOpen,
  MessageSquareQuote,
  HelpCircle,
  Home,
  Sliders,
  Users,
  UserCheck,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Inquiries & Bookings', href: '/admin/inquiries', icon: Inbox, badge: 'Live' },
    { label: 'Portfolio Projects', href: '/admin/portfolio', icon: Images },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Media Library', href: '/admin/media', icon: Film },
    { label: 'Services', href: '/admin/services', icon: Camera },
    { label: 'Packages (ETB)', href: '/admin/packages', icon: Tags },
    { label: 'Stories & Blog', href: '/admin/stories', icon: BookOpen },
    { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
    { label: 'FAQ', href: '/admin/faq', icon: HelpCircle },
    { label: 'Homepage & Hero', href: '/admin/homepage', icon: Home },
    { label: 'Studio Settings', href: '/admin/settings', icon: Sliders },
    { label: 'Users & Roles', href: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-neutral-900 text-neutral-300 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase px-3 py-2">
          Management System
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#6a1b2a] text-white shadow-md'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#b8865a]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#b8865a] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-500 text-center">
        Maya Pictures Admin v1.0
      </div>
    </aside>
  );
}
