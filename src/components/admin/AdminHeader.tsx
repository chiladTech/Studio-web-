'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ExternalLink, User as UserIcon, Shield, Menu } from 'lucide-react';

interface AdminHeaderProps {
  user?: {
    fullName: string;
    email: string;
    roleName?: string;
  };
  onMenuClick?: () => void;
}

export default function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    document.cookie = 'maya_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-[#6a1b2a] hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-[#6a1b2a]">
          MAYA PICTURES <span className="text-xs uppercase font-normal text-gray-500 bg-[#f4e8ea] px-2.5 py-0.5 rounded-full border border-[#6a1b2a]/10 ml-2">CMS Admin</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#6a1b2a] transition-colors"
        >
          <span className="hidden sm:inline">View Public Studio Site</span>
          <span className="sm:hidden">Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {user && (
          <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
            <div className="w-8 h-8 rounded-full bg-[#6a1b2a] text-white flex items-center justify-center text-xs font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-gray-900 leading-tight">{user.fullName}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#b8865a]" />
                <span>{user.roleName || 'Administrator'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}