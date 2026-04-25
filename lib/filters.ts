type GeoResult = {
  name?: string;
  country?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
};

const BAD_INPUT_PATTERNS = [
  /^[0-9]+$/,            // numbers only
  /^test/i,
  /^asdf/i,
  /^lol/i,
  /^fake/i,
  /^null/i,
  /^undefined/i,
];

function isSaneString(value?: string) {
  if (!value) return false;
  if (value.length < 2) return false;
  if (value.length > 80) return false;
  return true;
}

function hasCoordinates(lat?: number, lon?: number) {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    !isNaN(lat) &&
    !isNaN(lon)
  );
}

/**
 * Rejects obvious junk user input before API call
 */
export function isValidSearchQuery(query: string) {
  if (!query) return false;

  const trimmed = query.trim();

  if (trimmed.length < 2) return false;

  for (const pattern of BAD_INPUT_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  return true;
}

/**
 * Validates geocoding API response
 * THIS is your main "truth filter"
 */
export function isValidCityResult(result: GeoResult) {
  if (!result) return false;

  // Must have coordinates
  if (!hasCoordinates(result.latitude, result.longitude)) return false;

  // Must have a name
  if (!isSaneString(result.name)) return false;

  // Must have country OR region (some APIs vary)
  if (!isSaneString(result.country) && !isSaneString(result.admin1)) {
    return false;
  }

  return true;
}

/**
 * Normalizes API response into your internal format
 */
export function normalizeCity(result: GeoResult) {
  return {
    name: result.name || "Unknown",
    country: result.country || result.admin1 || "Unknown",
    state: result.admin1 || "",
    lat: result.latitude,
    lng: result.longitude,
  };
}
