import React from 'react';

interface EmptyStateProps {
  /** Optional lucide icon node, e.g. <Camera className="w-6 h-6 text-[#6a1b2a]" /> */
  icon?: React.ReactNode;
  title: string;
  message?: string;
}

/**
 * Intentional empty state shown when the database is reachable but a public
 * collection has no published content. Kept deliberately simple and styled
 * with the site's existing tokens (cream background, burgundy accent).
 */
export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 md:py-20 rounded-3xl border border-dashed border-[#e0cdd0] bg-white/70">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#f4e8ea] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <p className="text-base md:text-lg font-medium text-[#2e2a2a]">{title}</p>
      {message && <p className="text-sm text-[#8a6f70] mt-2 max-w-md leading-relaxed">{message}</p>}
    </div>
  );
}
