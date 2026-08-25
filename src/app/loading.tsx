import React from 'react';
import { Camera } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#fcf9f6] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#6a1b2a]/20 border-t-[#6a1b2a] animate-spin" />
        <Camera className="w-6 h-6 text-[#6a1b2a] absolute" />
      </div>
      <p className="text-xs font-semibold tracking-widest text-[#6a1b2a] uppercase animate-pulse">
        MAYA PICTURES
      </p>
    </div>
  );
}
