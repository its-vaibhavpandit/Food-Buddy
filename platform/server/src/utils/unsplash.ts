import { env } from '../config/env.js';

const FALLBACK_FOOD_IMAGES: Record<string, string> = {
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  samosa: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  momos: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80',
  noodles: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  fries: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
};

// In-memory LRU-style URL cache to prevent repetitive Unsplash API rate limit hits
const imageCache = new Map<string, string>();

/**
 * Searches Unsplash API for a food image by query keyword.
 * Returns cached image URL or fallback image on rate limit / error.
 */
export async function getFoodImageFromUnsplash(query: string): Promise<string> {
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Check in-memory cache
  if (imageCache.has(normalizedQuery)) {
    return imageCache.get(normalizedQuery)!;
  }

  // 2. Check if API key is provided
  if (!env.UNSPLASH_ACCESS_KEY || env.UNSPLASH_ACCESS_KEY === 'demo_unsplash_key') {
    return getFallbackImage(normalizedQuery);
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query + ' food'
    )}&per_page=1&orientation=squarish`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      console.warn(`[Unsplash API Warning] Status: ${response.status}. Using fallback.`);
      return getFallbackImage(normalizedQuery);
    }

    const data = (await response.json()) as {
      results?: Array<{ urls?: { regular?: string } }>;
    };

    if (data.results && data.results.length > 0 && data.results[0].urls?.regular) {
      const imageUrl = data.results[0].urls.regular;
      imageCache.set(normalizedQuery, imageUrl);
      return imageUrl;
    }
  } catch (error) {
    console.error('[Unsplash Search Error]:', error);
  }

  return getFallbackImage(normalizedQuery);
}

function getFallbackImage(query: string): string {
  for (const [key, fallbackUrl] of Object.entries(FALLBACK_FOOD_IMAGES)) {
    if (query.includes(key)) {
      return fallbackUrl;
    }
  }
  return FALLBACK_FOOD_IMAGES.default;
}
