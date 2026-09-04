import React from 'react';
import PublicNav from '@/components/public/PublicNav';
import Footer from '@/components/public/Footer';
import PackageCard from '@/components/public/PackageCard';
import EmptyState from '@/components/public/EmptyState';
import { getPublicSettings, getPackages } from '@/lib/site-data';
import { Tags } from 'lucide-react';

export const revalidate = 60;

const defaultPackages = [
  { id: '1', name: 'BEAUTY', priceDisplay: '2,000 ETB +', description: 'Perfect for small sessions & personal portraits.', duration: '1-2 Hours', deliverables: '15 Edited Digital Photos, Online Gallery, 1 Print', isFeatured: false },
  { id: '2', name: 'STANDARD', priceDisplay: '10,000 - 15,000 ETB +', description: 'Ideal for events, engagements & family sessions.', duration: 'Half-Day (4 Hours)', deliverables: '50 Edited Digital Photos, Full HD Highlights Video, Online Gallery', isFeatured: true },
  { id: '3', name: 'PREMIUM', priceDisplay: '80,000 ETB +', description: 'Complete all-inclusive coverage for your big day.', duration: 'Full Day Coverage', deliverables: 'Full Wedding Story, 4K Cinema Video, Photo Album, Drone Coverage, All RAW files', isFeatured: false },
];

export default async function PackagesPage() {
  const settings = await getPublicSettings();
  const packagesResult = await getPackages();
  const showEmptyState = !packagesResult.error && packagesResult.data.length === 0;
  const displayPackages = packagesResult.error ? defaultPackages : packagesResult.data;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <PublicNav settings={settings} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#6a1b2a] uppercase bg-[#f4e8ea] px-4 py-1.5 rounded-full mb-3">
            <Tags className="w-4 h-4" />
            <span>TRANSPARENT PRICING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1e1a1c]">
            Our <strong className="font-semibold text-[#6a1b2a]">Packages</strong>
          </h1>
          <p className="text-sm md:text-base text-[#4a3a3a] mt-3 leading-relaxed">
            Choose a package that fits your vision. All sessions include private online gallery delivery, high-resolution digital files, and expert editing.
          </p>
        </div>

        {showEmptyState ? (
          <EmptyState
            icon={<Tags className="w-6 h-6 text-[#6a1b2a]" />}
            title="No packages are currently available."
            message="Check back soon — new packages will appear here once published."
          />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayPackages.map((pkg: any) => (
            <PackageCard
              key={pkg.id}
              name={pkg.name}
              priceDisplay={pkg.priceDisplay}
              description={pkg.description}
              duration={pkg.duration || 'Flexible'}
              deliverables={typeof pkg.deliverables === 'string' ? pkg.deliverables : JSON.stringify(pkg.deliverables || '')}
              isFeatured={pkg.isFeatured}
            />
          ))}
        </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
