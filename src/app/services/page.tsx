import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PublicNav from '@/components/public/PublicNav';
import Footer from '@/components/public/Footer';
import { getPublicSettings, getServices } from '@/lib/site-data';
import EmptyState from '@/components/public/EmptyState';
import { Camera, Calendar } from 'lucide-react';

export const revalidate = 60;

const defaultServices = [
  { name: 'Wedding Photography', shortDesc: 'Elegant, candid coverage of your special day. We capture the laughter, tears, and timeless moments.', coverImage: '/images/wedding-1.jpg' },
  { name: 'Portrait Photography', shortDesc: 'Natural and stunning portraits that reflect your personality — from personal branding to family sessions.', coverImage: '/images/portrait_1.jpg' },
  { name: 'Event Photography', shortDesc: 'Corporate galas, private parties, cultural ceremonies, and everything in between.', coverImage: '/images/event-1.jpg' },
  { name: 'Fashion Photography', shortDesc: 'Editorial and commercial shoots with a refined aesthetic. We bring your creative vision to life.', coverImage: '/images/portrait_2.jpg' },
  { name: 'Product Photography', shortDesc: 'High-quality product imagery that highlights every detail and elevates your brand.', coverImage: '/images/product-1.jpg' },
  { name: 'Nature & Commercial', shortDesc: 'Capturing landscapes, wildlife, architectural spaces, and commercial brand storytelling.', coverImage: '/images/nature-1.jpg' },
];

export default async function ServicesPage() {
  const settings = await getPublicSettings();
  const servicesResult = await getServices();
  const showEmptyState = !servicesResult.error && servicesResult.data.length === 0;
  const displayList = servicesResult.error ? defaultServices : servicesResult.data;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <PublicNav settings={settings} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#6a1b2a] uppercase bg-[#f4e8ea] px-4 py-1.5 rounded-full mb-3">
            <Camera className="w-4 h-4" />
            <span>EXCELLENCE IN VISUAL STORYTELLING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1e1a1c]">
            Our <strong className="font-semibold text-[#6a1b2a]">Services</strong>
          </h1>
          <p className="text-sm md:text-base text-[#4a3a3a] mt-3 leading-relaxed">
            From intimate portrait sessions to grand wedding celebrations, Maya Pictures offers a full spectrum of professional photography & videography services tailored to your needs.
          </p>
        </div>

        {showEmptyState ? (
          <EmptyState
            icon={<Camera className="w-6 h-6 text-[#6a1b2a]" />}
            title="No services are currently available."
            message="Check back soon — new services will appear here once published."
          />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayList.map((svc: any, idx: number) => (
            <div
              key={svc.id || idx}
              className="bg-white rounded-3xl overflow-hidden border border-[#ece0e0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
            >
              <div className="relative h-48 overflow-hidden bg-neutral-900">
                <Image
                  src={svc.coverImage || '/images/wedding-1.jpg'}
                  alt={svc.name || svc.title}
                  fill
                  priority={idx < 3}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-full bg-[#6a1b2a] flex items-center justify-center shadow-lg">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg drop-shadow">{svc.name || svc.title}</h3>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <p className="text-sm text-[#4a3a3a] leading-relaxed mb-6">{svc.shortDesc || svc.desc}</p>

                <Link
                  href={`/book?service=${encodeURIComponent(svc.name || svc.title)}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#f4e8ea] text-[#6a1b2a] hover:bg-[#6a1b2a] hover:text-white font-semibold text-xs tracking-wider uppercase transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>BOOK THIS SERVICE</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
