import {
  isValidSearchQuery,
  isValidCityResult,
  normalizeCity,
} from "./filters";
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
 * Geocoding API (NO timezone exists here)
 */
async function geocodeCity(query: string): Promise<City | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=1&language=en&format=json`;

  const data = await cachedFetch<any>(
    `geo:${query}`,
    url,
    1000 * 60 * 60 * 24
  );

  if (!data?.results?.length) return null;

  const result = data.results[0];

  if (!isValidCityResult(result)) return null;

  const normalized = normalizeCity(result);

  const lat = Number(normalized.lat ?? result.latitude);
  const lng = Number(normalized.lng ?? result.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    name: normalized.name,
    country: normalized.country,
    state: normalized.state,

    // 🔥 FIX: NEVER use geo.timezone (doesn't exist)
    timezone: "UTC",

    lat,
    lng,
    slug: generateCitySlug(normalized),
  };
}

/**
 * Local dataset search (FAST)
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
 * MAIN RESOLVER
 */
export async function resolveCity(
  query: string,
  allCities: City[]
): Promise<City | null> {
  if (!isValidSearchQuery(query)) return null;

  const cached = cache.get<City>(`city:${query}`);
  if (cached) return cached;

  // 1. LOCAL FIRST
  const local = findLocalCity(query, allCities);

  if (local) {
    const lat = Number(local.lat);
    const lng = Number(local.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const enriched: City = {
      ...local,
      lat,
      lng,
      timezone: local.timezone ?? "UTC",
      slug: generateCitySlug(local),
    };

    cache.set(`city:${query}`, enriched, 1000 * 60 * 60 * 24);
    return enriched;
  }

  // 2. FALLBACK API
  const geo = await geocodeCity(query);
  if (!geo) return null;

  const city: City = {
    name: geo.name,
    country: geo.country,
    state: geo.state,
    lat: geo.lat,
    lng: geo.lng,

    // 🔥 STILL NO timezone from API
    timezone: "UTC",

    slug: generateCitySlug(geo),
  };

  cache.set(`city:${query}`, city, 1000 * 60 * 60 * 24);

  return city;
}

/**
 * OPTIONAL: SEO batch
 */
export async function enrichCities(list: City[]) {
  return list.map((city) => ({
    ...city,
    lat: Number(city.lat),
    lng: Number(city.lng),
    timezone: city.timezone ?? "UTC",
    slug: generateCitySlug(city),
  }));
}
