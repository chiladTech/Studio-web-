import { revalidateTag } from 'next/cache';
import { PUBLIC_DATA_TAG } from '@/lib/site-data';

/**
 * Called by every admin write API after a successful mutation of public
 * content (settings, portfolio, packages, services, stories, FAQs,
 * testimonials, categories, media). Invalidates the public data cache so the
 * next page view is regenerated with the new content immediately instead of
 * waiting for the revalidate window to lapse.
 */
export function revalidatePublicData(): void {
  revalidateTag(PUBLIC_DATA_TAG);
}
