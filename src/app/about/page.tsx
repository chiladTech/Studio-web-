import React from 'react';
import Link from 'next/link';
import PublicNav from '@/components/public/PublicNav';
import Footer from '@/components/public/Footer';
import { getPublicSettings } from '@/lib/site-data';
import { Camera, Heart, Eye, Award, Calendar } from 'lucide-react';

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getPublicSettings();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <PublicNav settings={settings} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 w-full py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#6a1b2a] uppercase bg-[#f4e8ea] px-4 py-1.5 rounded-full mb-3">
            <Camera className="w-4 h-4" />
            <span>THE MAYA PICTURES STORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#1e1a1c]">
            About <strong className="font-semibold text-[#6a1b2a]">MAYA PICTURES</strong>
          </h1>
          <p className="text-sm md:text-base text-[#4a3a3a] mt-3 leading-relaxed">
            We are a team of passionate visual storytellers dedicated to capturing authentic emotions, timeless wedding memories, and high-impact commercial imagery.
          </p>
        </div>

        {/* Studio Story Grid */}
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#ece0e0] shadow-sm space-y-4">
            <h2 className="text-2xl font-semibold text-[#6a1b2a]">Our Photography Philosophy</h2>
            <p className="text-sm md:text-base text-[#2a2222] leading-relaxed">
              At Maya Pictures, we believe that true photography goes beyond technical precision — it is about feeling. Whether documenting traditional cultural ceremonies (ሽምግልና), high-energy event galas, or quiet portrait moments, our goal is to preserve genuine human connection in every frame.
            </p>
            <p className="text-sm md:text-base text-[#2a2222] leading-relaxed">
              With over 10 years of experience serving clients across Gondar, Addis Ababa, and beyond, our team brings editorial elegance, modern equipment, and a seamless client experience to every project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#f4e8ea] p-8 rounded-3xl space-y-3 border border-[#6a1b2a]/10">
              <div className="w-12 h-12 rounded-full bg-[#6a1b2a] text-white flex items-center justify-center mb-2">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#6a1b2a]">Our Vision</h3>
              <p className="text-sm text-[#4a3a3a] leading-relaxed">
                To create evocative, honest visual art that stands the test of time and honors every client&apos;s unique story.
              </p>
            </div>

            <div className="bg-[#f4e8ea] p-8 rounded-3xl space-y-3 border border-[#6a1b2a]/10">
              <div className="w-12 h-12 rounded-full bg-[#6a1b2a] text-white flex items-center justify-center mb-2">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#6a1b2a]">Our Values</h3>
              <p className="text-sm text-[#4a3a3a] leading-relaxed">
                Integrity, passion for creativity, reliability, and a commitment to providing extraordinary imagery.
              </p>
            </div>
          </div>

          {/* Booking CTA Banner */}
          <div className="bg-[#6a1b2a] text-white rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-light">
              Ready to create something <strong className="font-semibold">extraordinary together?</strong>
            </h2>
            <p className="text-sm text-white/90 max-w-xl mx-auto">
              Get in touch with our studio to check session availability and discuss your upcoming event.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-white text-[#6a1b2a] hover:bg-[#f4e8ea] px-8 py-3.5 rounded-full font-semibold text-xs tracking-widest uppercase transition-all shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>BOOK A SESSION</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
