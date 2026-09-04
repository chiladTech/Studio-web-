import PublicNav from '@/components/public/PublicNav';
import Footer from '@/components/public/Footer';
import { getPublicSettings } from '@/lib/site-data';

export const revalidate = 60;

export default async function TermsPage() {
  const settings = await getPublicSettings();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <PublicNav settings={settings} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light text-[#1e1a1c] mb-6">
          Terms & <strong className="font-semibold text-[#6a1b2a]">Conditions</strong>
        </h1>
        <div className="bg-white rounded-3xl p-8 border border-[#ece0e0] shadow-sm space-y-4 text-sm text-[#3a2a2a] leading-relaxed">
          <p>Welcome to Maya Pictures. By accessing our website and placing session booking requests, you agree to comply with these terms.</p>
          <h3 className="text-base font-semibold text-[#6a1b2a] pt-2">Booking Reservations</h3>
          <p>Submitting an inquiry request on our website does not automatically confirm session reservation. All bookings are finalized upon written confirmation and deposit agreement with Maya Pictures studio management.</p>
          <h3 className="text-base font-semibold text-[#6a1b2a] pt-2">Copyright & Intellectual Property</h3>
          <p>All photographs, video highlights, branding assets, and code on this website remain the sole intellectual property of Maya Pictures Studio unless otherwise specified.</p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
