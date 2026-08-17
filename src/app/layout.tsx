import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maya Pictures | Professional Photography Studio & Videography',
  description:
    'Maya Pictures is a premium photography studio specializing in weddings, portraits, events, fashion, product, and commercial videography.',
  keywords: 'Maya Pictures, Photography Studio, Wedding Photography, Ethiopia Photography, Gondar, Addis Ababa, Videography',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#fcf9f6] text-[#1e1a1c] selection:bg-[#6a1b2a] selection:text-white">
        {children}
      </body>
    </html>
  );
}
