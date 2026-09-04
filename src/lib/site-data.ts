import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

/**
 * Single source of truth for all PUBLIC website content reads.
 *
 * - Public pages render from these getters directly (no per-page client fetches).
 * - Every getter is cached in the Next data cache (tag: PUBLIC_DATA_TAG) and
 *   revalidated on demand whenever admin writes content, so CMS edits appear
 *   on the public site immediately (see src/lib/revalidate.ts).
 * - Result shape: every collection getter returns `{ data, error }` so pages
 *   can tell a REAL database failure apart from a successful-but-empty result:
 *     - DB failure            -> `{ data: [], error: true }` (logged; never a 500)
 *     - DB ok, zero published -> `{ data: [], error: false }`
 *     - DB ok, published rows -> `{ data: [...published only...], error: false }`
 *   Draft/unpublished rows are always filtered out at the query level.
 *   Pages use the error flag to decide whether to fall back to resilient
 *   demo content (outage) or render an intentional empty state (no content).
 *
 * Do NOT import this file from client components — it runs server-side only.
 */

export const PUBLIC_DATA_TAG = 'public-data';

/** Seconds a cached public read may live before revalidation is attempted. */
const REVALIDATE_SECONDS = Number(process.env.PUBLIC_REVALIDATE_SECONDS ?? 60);

export interface PublicDataResult<T> {
  /** Rows returned by the database (published-only). [] when none or on failure. */
  data: T;
  /** true only when the database read itself failed (outage / unreachable). */
  error: boolean;
}

type PublicSettingsMap = Record<string, any>;

async function loadSettingsRaw(): Promise<PublicSettingsMap> {
  try {
    const settings = await prisma.websiteSetting.findMany();
    const map: PublicSettingsMap = {};
    for (const s of settings) {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    }
    return map;
  } catch (error) {
    console.error('[site-data] settings read failed:', error);
    return {};
  }
}

/** Settings keep returning the raw map (pages already default individual keys inline). */
export const getPublicSettings = unstable_cache(loadSettingsRaw, ['public', 'settings'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [PUBLIC_DATA_TAG],
});

/** Portfolio projects as returned by GET /api/v1/portfolio (category + ordered media). */
async function loadPortfolioProjects(): Promise<PublicDataResult<any[]>> {
  try {
    const data = await prisma.portfolioProject.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        media: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data, error: false };
  } catch (error) {
    console.error('[site-data] portfolio read failed:', error);
    return { data: [], error: true };
  }
}

export const getPortfolioProjects = unstable_cache(loadPortfolioProjects, ['public', 'portfolio'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [PUBLIC_DATA_TAG],
});

export interface PublicPortfolioItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  label: string;
  subLabel?: string;
  category?: string;
}

/** Grid-ready portfolio items — mirrors the mapping the client pages used to do. */
export async function getPublicPortfolioItems(): Promise<PublicDataResult<PublicPortfolioItem[]>> {
  const result = await getPortfolioProjects();
  if (result.error) {
    return { data: [], error: true };
  }
  return {
    data: result.data.map((p) => ({
      id: p.id,
      type: p.coverImage?.endsWith('.mp4') ? 'video' : 'image',
      src: p.coverImage || '/images/wedding-1.jpg',
      label: p.title.toUpperCase(),
      subLabel: p.category?.name || 'STUDIO WORK',
      category: p.category?.slug || 'all',
    })),
    error: false,
  };
}

async function loadPackages(): Promise<PublicDataResult<any[]>> {
  try {
    const data = await prisma.package.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
    });
    return { data, error: false };
  } catch (error) {
    console.error('[site-data] packages read failed:', error);
    return { data: [], error: true };
  }
}

export const getPackages = unstable_cache(loadPackages, ['public', 'packages'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [PUBLIC_DATA_TAG],
});

async function loadServices(): Promise<PublicDataResult<any[]>> {
  try {
    const data = await prisma.service.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
    });
    return { data, error: false };
  } catch (error) {
    console.error('[site-data] services read failed:', error);
    return { data: [], error: true };
  }
}

export const getServices = unstable_cache(loadServices, ['public', 'services'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [PUBLIC_DATA_TAG],
});

async function loadStories(): Promise<PublicDataResult<any[]>> {
  try {
    const data = await prisma.story.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
    return { data, error: false };
  } catch (error) {
    console.error('[site-data] stories read failed:', error);
    return { data: [], error: true };
  }
}

export const getStories = unstable_cache(loadStories, ['public', 'stories'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [PUBLIC_DATA_TAG],
});

async function loadFaqs(): Promise<PublicDataResult<any[]>> {
  try {
    const data = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
    });
    return { data, error: false };
  } catch (error) {
    console.error('[site-data] faq read failed:', error);
    return { data: [], error: true };
  }
}

export const getFaqs = unstable_cache(loadFaqs, ['public', 'faq'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [PUBLIC_DATA_TAG],
});

async function loadTestimonials(): Promise<PublicDataResult<any[]>> {
  try {
    const data = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
    });
    return { data, error: false };
  } catch (error) {
    console.error('[site-data] testimonials read failed:', error);
    return { data: [], error: true };
  }
}

export const getTestimonials = unstable_cache(loadTestimonials, ['public', 'testimonials'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [PUBLIC_DATA_TAG],
});
