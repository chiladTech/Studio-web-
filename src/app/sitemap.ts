import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mayapictures.com';
  const currentDate = new Date().toISOString();

  const publicRoutes = [
    '',
    '/about',
    '/portfolio',
    '/services',
    '/packages',
    '/stories',
    '/faq',
    '/contact',
    '/book',
    '/privacy',
    '/terms',
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/portfolio' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/portfolio' || route === '/book' ? 0.9 : 0.7,
  }));
}
