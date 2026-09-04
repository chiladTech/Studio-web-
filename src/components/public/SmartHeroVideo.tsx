'use client';

import React, { useEffect, useState } from 'react';

interface SmartHeroVideoProps {
  videoUrl?: string;
}

/**
 * Hero background video.
 *
 * - Renders nothing until the client confirms the device should download video:
 *   desktop width AND no reduced-motion/reduced-data preference. Mobile and
 *   data-saver users keep the (small) poster image instead of a multi-MB clip.
 * - If the video fails to load, it unmounts itself and the poster stays.
 * - The hero text/poster render immediately in the server HTML — nothing blocks
 *   first paint while this decides.
 */
export default function SmartHeroVideo({ videoUrl }: SmartHeroVideoProps) {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 768px)');
    const mqReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqReducedData = window.matchMedia('(prefers-reduced-data: reduce)');

    const shouldEnable = () =>
      mqDesktop.matches &&
      !mqReducedMotion.matches &&
      !(typeof mqReducedData.matches === 'boolean' && mqReducedData.matches);

    const apply = () => setEnabled(shouldEnable());

    apply();
    mqDesktop.addEventListener('change', apply);
    mqReducedMotion.addEventListener('change', apply);
    if (typeof mqReducedData.addEventListener === 'function') {
      mqReducedData.addEventListener('change', apply);
    }

    return () => {
      mqDesktop.removeEventListener('change', apply);
      mqReducedMotion.removeEventListener('change', apply);
      if (typeof mqReducedData.removeEventListener === 'function') {
        mqReducedData.removeEventListener('change', apply);
      }
    };
  }, []);

  if (!enabled || failed || !videoUrl) return null;

  return (
    <video
      key={videoUrl}
      src={videoUrl}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover z-0"
      style={{ animation: 'fadeInVideo 0.8s ease-in forwards' }}
      onError={() => setFailed(true)}
    />
  );
}
