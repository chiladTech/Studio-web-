'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface LightboxItem {
  type: 'image' | 'video';
  src: string;
  label?: string;
  subLabel?: string;
}

interface LightboxModalProps {
  isOpen: boolean;
  items: LightboxItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function LightboxModal({
  isOpen,
  items,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate((currentIndex - 1 + items.length) % items.length);
      } else if (e.key === 'ArrowRight') {
        onNavigate((currentIndex + 1) % items.length);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="Close Lightbox"
        className="absolute top-6 right-6 z-[10000] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 hover:rotate-90"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Prev Navigation Button */}
      {items.length > 1 && (
        <button
          onClick={() => onNavigate((currentIndex - 1 + items.length) % items.length)}
          aria-label="Previous item"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[10000] text-white/70 hover:text-white p-3 rounded-full bg-black/40 hover:bg-black/70 transition-all"
        >
          <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
        </button>
      )}

      {/* Media Display Area */}
      <div className="relative max-w-[90vw] max-h-[80vh] flex flex-col items-center justify-center">
        {currentItem.type === 'video' ? (
          <video
            src={currentItem.src}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[75vh] rounded-xl bg-black shadow-2xl object-contain"
          />
        ) : (
          <img
            src={currentItem.src}
            alt={currentItem.label || 'Portfolio Image'}
            className="max-w-full max-h-[75vh] rounded-xl shadow-2xl object-contain"
          />
        )}

        {/* Caption */}
        {(currentItem.label || currentItem.subLabel) && (
          <div className="mt-4 bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm px-6 py-2 rounded-full border border-white/10 text-center font-medium">
            {currentItem.label} {currentItem.subLabel ? `· ${currentItem.subLabel}` : ''}
          </div>
        )}
      </div>

      {/* Next Navigation Button */}
      {items.length > 1 && (
        <button
          onClick={() => onNavigate((currentIndex + 1) % items.length)}
          aria-label="Next item"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[10000] text-white/70 hover:text-white p-3 rounded-full bg-black/40 hover:bg-black/70 transition-all"
        >
          <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
        </button>
      )}

      {/* Item Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white/70 text-xs px-4 py-1.5 rounded-full border border-white/10 font-mono">
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
}
