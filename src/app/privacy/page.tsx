import PublicNav from '@/components/public/PublicNav';
import Footer from '@/components/public/Footer';
import { getPublicSettings } from '@/lib/site-data';

export const revalidate = 60;

export default async function PrivacyPage() {
  const settings = await getPublicSettings();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fcf9f6]">
      <PublicNav settings={settings} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light text-[#1e1a1c] mb-6">
          Privacy <strong className="font-semibold text-[#6a1b2a]">Policy</strong>
        </h1>
        <div className="bg-white rounded-3xl p-8 border border-[#ece0e0] shadow-sm space-y-4 text-sm text-[#3a2a2a] leading-relaxed">
          <p>At Maya Pictures, we respect your privacy and are committed to protecting the personal information you share with us through our website and booking inquiry forms.</p>
          <h3 className="text-base font-semibold text-[#6a1b2a] pt-2">Information We Collect</h3>
          <p>We collect personal information such as your name, email address, phone number, and event details when you submit booking inquiries or subscribe to our newsletter.</p>
          <h3 className="text-base font-semibold text-[#6a1b2a] pt-2">Use of Information</h3>
          <p>Your information is strictly used to process session reservations, respond to client inquiries, and deliver password-protected online galleries.</p>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
