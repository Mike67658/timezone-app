import { isValidSearchQuery, isValidCityResult, normalizeCity } from "./filters";
import { cache, cachedFetch } from "./cache";
import { generateCitySlug } from "./slugs";

type City = {
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lng: number;
  timezone?: string;
  slug?: string;
};

/**
 * Geocoding API (free, no key required)
 * You can swap later if you want higher accuracy
 */
async function geocodeCity(query: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=1&language=en&format=json`;

  const data = await cachedFetch<any>(`geo:${query}`, url, 1000 * 60 * 60 * 24);

  if (!data?.results?.length) return null;

  const result = data.results[0];

  if (!isValidCityResult(result)) return null;

  return normalizeCity(result);
}

/**
 * Try local dataset first (FAST PATH)
 */
export function findLocalCity(query: string, allCities: City[]) {
  const lower = query.toLowerCase().trim();

  return (
    allCities.find((c) => c.name.toLowerCase() === lower) ||
    allCities.find((c) => c.name.toLowerCase().includes(lower)) ||
    null
  );
}

/**
 * MAIN ENTRY POINT
 * - search city
 * - check local JSON
 * - fallback to geocoding
 * - return normalized SEO-ready city
 */
export async function resolveCity(
  query: string,
  allCities: City[]
): Promise<City | null> {
  if (!isValidSearchQuery(query)) return null;

  const cached = cache.get<City>(`city:${query}`);
  if (cached) return cached;

  // 1. try local dataset first
  const local = findLocalCity(query, allCities);

  if (local) {
    const enriched = {
      ...local,
      slug: generateCitySlug(local),
    };

    cache.set(`city:${query}`, enriched, 1000 * 60 * 60 * 24);
    return enriched;
  }

  // 2. fallback to geocoding API
  const geo = await geocodeCity(query);

  if (!geo) return null;

  const city: City = {
    ...geo,
    slug: generateCitySlug(geo),
  };

  cache.set(`city:${query}`, city, 1000 * 60 * 60 * 24);

  return city;
}

/**
 * OPTIONAL: batch enrichment (for SEO pre-generation later)
 */
export async function enrichCities(list: City[]) {
  return list.map((city) => ({
    ...city,
    slug: generateCitySlug(city),
  }));
}
