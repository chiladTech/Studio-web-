'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Film, Upload, Images, CheckCircle } from 'lucide-react';

export default function AdminMediaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);

  // Pre-populated media assets from local directory
  const localMedia = [
    { name: 'wedding-1.jpg', url: '/images/wedding-1.jpg', type: 'image' },
    { name: 'wedding-2.jpg', url: '/images/wedding-2.jpg', type: 'image' },
    { name: 'wedding-video.mp4', url: '/images/wedding-video.mp4', type: 'video' },
    { name: 'portrait_1.jpg', url: '/images/portrait_1.jpg', type: 'image' },
    { name: 'portrait_2.jpg', url: '/images/portrait_2.jpg', type: 'image' },
    { name: 'event-1.jpg', url: '/images/event-1.jpg', type: 'image' },
    { name: 'event-2.jpg', url: '/images/event-2.jpg', type: 'image' },
    { name: 'event-3.jpg', url: '/images/event-3.jpg', type: 'image' },
    { name: 'event-4.jpg', url: '/images/event-4.jpg', type: 'image' },
    { name: 'event-video.mp4', url: '/images/event-video.mp4', type: 'video' },
    { name: 'fashion-video.mp4', url: '/images/fashion-video.mp4', type: 'video' },
    { name: 'nature-1.jpg', url: '/images/nature-1.jpg', type: 'image' },
    { name: 'nature-2.jpg', url: '/images/nature-2.jpg', type: 'image' },
    { name: 'product-1.jpg', url: '/images/product-1.jpg', type: 'image' },
    { name: 'product-2.jpg', url: '/images/product-2.jpg', type: 'image' },
    { name: 'ሽምግልና-video.mp4', url: '/images/ሽምግልና-video.mp4', type: 'video' },
    { name: 'ሽምግልና1-video.mp4', url: '/images/ሽምግልና1-video.mp4', type: 'video' },
    { name: 'background.mp4', url: '/background.mp4', type: 'video' },
  ];

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) { router.push('/admin/login'); return; }
      const data = await res.json();
      setUser(data.user);
      setAssets(localMedia);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <AdminHeader user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-[#6a1b2a]" />
                Media Library
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Manage photo & video assets stored in studio public directory</p>
            </div>
            <div className="bg-[#f4e8ea] text-[#6a1b2a] px-4 py-2 rounded-xl text-xs font-bold">
              {assets.length} Total Assets
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden group">
                <div className="h-36 bg-neutral-900 relative flex items-center justify-center">
                  {item.type === 'video' ? (
                    <video src={item.url} muted className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  )}
                  <span className={`absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${item.type === 'video' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {item.type}
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-xs font-semibold text-neutral-800 truncate" title={item.name}>{item.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono truncate mt-0.5">{item.url}</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
