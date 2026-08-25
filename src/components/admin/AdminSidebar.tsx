'use client';

import React, { useEffect, useState } from 'react';
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
  Navigation,
  ShieldCheck,
  BarChart3,
  History,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const ALL_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Studio Operations',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Inquiries & Bookings', href: '/admin/inquiries', icon: Inbox, badge: 'Live' },
      { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Content Management',
    items: [
      { label: 'Portfolio Projects', href: '/admin/portfolio', icon: Images },
      { label: 'Categories', href: '/admin/categories', icon: FolderTree },
      { label: 'Media Library', href: '/admin/media', icon: Film },
      { label: 'Services', href: '/admin/services', icon: Camera },
      { label: 'Packages (ETB)', href: '/admin/packages', icon: Tags },
      { label: 'Stories & Blog', href: '/admin/stories', icon: BookOpen },
      { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
      { label: 'FAQ', href: '/admin/faq', icon: HelpCircle },
    ],
  },
  {
    title: 'Website Settings',
    items: [
      { label: 'Homepage & Hero', href: '/admin/homepage', icon: Home },
      { label: 'Nav & Footer Links', href: '/admin/nav-footer', icon: Navigation },
      { label: 'Studio Settings', href: '/admin/settings', icon: Sliders },
      { label: 'Users & Roles', href: '/admin/users', icon: Users },
      { label: 'Activity Audit Logs', href: '/admin/audit-logs', icon: History },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allowedPages, setAllowedPages] = useState<string[] | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          if (data.user?.roleName === 'CONTENT_ADMINISTRATOR') {
            setAllowedPages(data.user.allowedPages || []);
          } else {
            setAllowedPages(null); // System admin has access to everything
          }
        }
      } catch (e) {}
    }
    loadUser();
  }, []);

  // Filter sections based on permissions if user is Content Admin
  const filteredSections = ALL_SIDEBAR_SECTIONS.map((section) => {
    if (!allowedPages) return section; // System admin sees all

    const visibleItems = section.items.filter((item) => allowedPages.includes(item.href));
    return {
      ...section,
      items: visibleItems,
    };
  }).filter((section) => section.items.length > 0);

  return (
    <aside className="w-64 bg-neutral-900 text-neutral-300 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div className="space-y-5">
        {currentUser?.roleName && (
          <div className="px-3 py-2 bg-neutral-800/80 rounded-xl border border-neutral-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${currentUser.roleName === 'SYSTEM_ADMINISTRATOR' ? 'text-amber-400' : 'text-blue-400'}`} />
              <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-200">
                {currentUser.roleName === 'SYSTEM_ADMINISTRATOR' ? 'System Admin' : 'Content Admin'}
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${currentUser.roleName === 'SYSTEM_ADMINISTRATOR' ? 'bg-amber-400' : 'bg-blue-400'}`} />
          </div>
        )}

        {filteredSections.map((section) => (
          <div key={section.title}>
            <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase px-3 py-1.5">
              {section.title}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
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
        ))}

        {filteredSections.length === 0 && (
          <div className="p-4 text-center text-xs text-neutral-500 bg-neutral-800/40 rounded-xl">
            No pages assigned. Contact System Admin.
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-500 text-center">
        Maya Pictures CMS v1.0
      </div>
    </aside>
  );
}
