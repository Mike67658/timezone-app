type CityLike = {
  name: string;
  country?: string;
  state?: string;
};

/**
 * Clean string for URLs
 */
function clean(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Country normalization (optional expansion later)
 */
function normalizeCountry(country?: string) {
  if (!country) return "";

  const map: Record<string, string> = {
    US: "usa",
    USA: "usa",
    CA: "canada",
    MX: "mexico",
    GB: "uk",
    UK: "uk",
    JP: "japan",
    PH: "philippines",
    AE: "uae",
  };

  return map[country.toUpperCase()] || clean(country);
}

/**
 * State normalization (handles ambiguity like MO vs Mexico City)
 */
function normalizeState(state?: string) {
  if (!state) return "";

  // If it's a US state code, keep it readable
  return clean(state);
}

/**
 * Main SEO slug generator
 */
export function generateCitySlug(city: CityLike) {
  const name = clean(city.name);

  const country = normalizeCountry(city.country);
  const state = normalizeState(city.state);

  // Build hierarchy intelligently
  if (state && country) {
    return `${name}-${state}-${country}`;
  }

  if (country) {
    return `${name}-${country}`;
  }

  return name;
}

/**
 * Reverse-safe label builder for UI / SEO pages
 */
export function formatCityLabel(city: CityLike) {
  if (city.state) {
    return `${city.name}, ${city.state}`;
  }

  if (city.country) {
    return `${city.name}, ${city.country}`;
  }

  return city.name;
}
