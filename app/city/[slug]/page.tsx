import { notFound } from "next/navigation";
import Link from "next/link";
import { generateCitySlug } from "@/lib/slugs";

type City = {
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lng: number;
  timezone?: string;
  population?: number;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://www.timebycity.net";
}

async function getCities(): Promise<City[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/cities_search_final.json`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    const data = await res.json();

    return data.map((c: any) => ({
      ...c,
      lat: Number(c.lat),
      lng: Number(c.lng),
      population: Number(c.population || 0),
    }));
  } catch {
    return [];
  }
}

function findCityBySlug(slug: string, cities: City[]) {
  const wanted = slug.toLowerCase();

  return (
    cities.find((c) => generateCitySlug(c).toLowerCase() === wanted) || null
  );
}

function getPlaceName(city: City) {
  return `${city.name}${city.state ? `, ${city.state}` : ""}${
    city.country ? `, ${city.country}` : ""
  }`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cities = await getCities();
  const city = findCityBySlug(slug, cities);

  if (!city) {
    return {
      title: "City Not Found | TimeByCity",
      description:
        "Search cities worldwide by current local time, date, time zone, weather, latitude, and longitude.",
    };
  }

  const placeName = getPlaceName(city);
  const canonicalSlug = generateCitySlug(city);

  return {
    title: `Current Time in ${placeName} | TimeByCity`,
    description: `Check the current local time in ${placeName}, including date, time zone, weather, latitude, and longitude coordinates.`,
    alternates: {
      canonical: `https://www.timebycity.net/city/${canonicalSlug}`,
    },
    openGraph: {
      title: `Current Time in ${placeName} | TimeByCity`,
      description: `View the current time, date, time zone, weather, latitude, and longitude for ${placeName}.`,
      url: `https://www.timebycity.net/city/${canonicalSlug}`,
      siteName: "TimeByCity",
      type: "website",
    },
  };
}

async function getWeather(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`,
      {
        next: { revalidate: 1800 },
      }
    );

    const data = await res.json();
    return data?.current_weather ?? null;
  } catch {
    return null;
  }
}

function weatherCodeToText(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Storm";
  return "Unknown";
}

function toF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

function distanceScore(a: City, b: City) {
  return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));
}

function AdSlot({ label }: { label: string }) {
  return (
    <div className="min-h-[120px] rounded-xl border border-cyan-500/10 bg-black/20 flex items-center justify-center text-xs text-gray-600">
      Advertisement Placeholder — {label}
    </div>
  );
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cities = await getCities();
  const city = findCityBySlug(slug, cities);

  if (!city) return notFound();

  const weather = await getWeather(city.lat, city.lng);
  const now = new Date();

  const placeName = getPlaceName(city);
  const currentSlug = generateCitySlug(city);

  const time = city.timezone
    ? now.toLocaleTimeString("en-US", {
        timeZone: city.timezone,
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  const date = city.timezone
    ? now.toLocaleDateString("en-US", {
        timeZone: city.timezone,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const nearbyCities = cities
    .filter(
      (c) =>
        generateCitySlug(c) !== currentSlug &&
        Number.isFinite(c.lat) &&
        Number.isFinite(c.lng)
    )
    .map((c) => ({ ...c, distance: distanceScore(city, c) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 9);

  const sameTimezoneCities = cities
    .filter(
      (c) =>
        c.timezone === city.timezone &&
        generateCitySlug(c) !== currentSlug
    )
    .slice(0, 9);

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <div className="flex justify-end">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
          >
            🔍 New Search
          </Link>
        </div>

        <section className="p-6 bg-black/40 border border-cyan-400/30 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.15)]">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-200">
            Current Time in {placeName}
          </h1>

          <div className="text-5xl font-mono text-cyan-300 mt-4">{time}</div>

          <div className="text-sm text-cyan-200 mt-2">{date}</div>

          {weather ? (
            <div className="mt-4 text-gray-300">
              Current weather: {Math.round(weather.temperature)}°C /{" "}
              {toF(weather.temperature)}°F •{" "}
              {weatherCodeToText(weather.weathercode)}
            </div>
          ) : (
            <div className="mt-4 text-gray-400">
              Weather data is temporarily unavailable.
            </div>
          )}

          <div className="text-sm text-gray-400 mt-3">
            Latitude: {city.lat.toFixed(4)} • Longitude: {city.lng.toFixed(4)}
          </div>
        </section>

        <AdSlot label="Top City Page" />

        <section className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-cyan-300">
            Time, Weather, and Coordinates for {city.name}
          </h2>

          <p>
            This page shows the current local time in {placeName}, along with
            the local date, time zone, weather information when available, and
            the city&apos;s latitude and longitude coordinates.
          </p>

          <p>
            {city.name} uses the{" "}
            <span className="text-cyan-200">{city.timezone || "local"}</span>{" "}
            time zone. This information can help with planning phone calls,
            online meetings, travel, deliveries, or checking the local time
            before contacting someone in another city.
          </p>

          <p>
            The latitude and longitude shown for {city.name} are useful for map
            lookup, weather location matching, travel planning, geographic
            reference, and time zone identification.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-black/30 border border-cyan-400/20 rounded-xl">
            <h3 className="text-cyan-300 font-semibold">Local Time</h3>
            <div className="text-2xl font-mono text-cyan-200 mt-2">{time}</div>
          </div>

          <div className="p-5 bg-black/30 border border-cyan-400/20 rounded-xl">
            <h3 className="text-cyan-300 font-semibold">Time Zone</h3>
            <div className="text-cyan-200 mt-2">{city.timezone || "—"}</div>
          </div>

          <div className="p-5 bg-black/30 border border-cyan-400/20 rounded-xl">
            <h3 className="text-cyan-300 font-semibold">Coordinates</h3>
            <div className="text-cyan-200 mt-2">
              {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
            </div>
          </div>
        </section>

        <AdSlot label="Middle City Page" />

        <section className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl">
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">
            Nearby Cities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nearbyCities.map((c, i) => (
              <Link
                key={i}
                href={`/city/${generateCitySlug(c)}`}
                className="p-4 bg-black/30 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/10 transition"
              >
                <div className="text-cyan-200 font-semibold">{c.name}</div>
                <div className="text-xs text-gray-400">
                  {c.country} {c.state}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  LAT {c.lat.toFixed(2)} • LNG {c.lng.toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl">
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">
            Other Cities in the Same Time Zone
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sameTimezoneCities.map((c, i) => (
              <Link
                key={i}
                href={`/city/${generateCitySlug(c)}`}
                className="p-4 bg-black/30 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/10 transition"
              >
                <div className="text-cyan-200 font-semibold">{c.name}</div>
                <div className="text-xs text-gray-400">
                  {c.country} {c.state}
                </div>
                <div className="text-xs text-gray-500 mt-1">{c.timezone}</div>
              </Link>
            ))}
          </div>
        </section>

        <AdSlot label="Lower City Page" />

        <section className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl space-y-5 text-gray-300">
          <h2 className="text-2xl font-bold text-cyan-300">
            Frequently Asked Questions About {city.name}
          </h2>

          <div>
            <h3 className="text-cyan-200 font-semibold">
              What time is it in {city.name} right now?
            </h3>
            <p>
              The current local time in {city.name} is {time}. The date in{" "}
              {city.name} is {date}.
            </p>
          </div>

          <div>
            <h3 className="text-cyan-200 font-semibold">
              What time zone is {city.name} in?
            </h3>
            <p>
              {city.name} is listed in the {city.timezone || "local"} time zone.
            </p>
          </div>

          <div>
            <h3 className="text-cyan-200 font-semibold">
              What are the latitude and longitude of {city.name}?
            </h3>
            <p>
              The coordinates for {city.name} are latitude{" "}
              {city.lat.toFixed(4)} and longitude {city.lng.toFixed(4)}.
            </p>
          </div>

          <div>
            <h3 className="text-cyan-200 font-semibold">
              Does this page show weather for {city.name}?
            </h3>
            <p>
              Yes. When available, this page shows current weather information
              for {city.name}. Weather is refreshed periodically so the page
              stays useful without making unnecessary API requests.
            </p>
          </div>
        </section>

        <AdSlot label="Bottom City Page" />

        <footer className="pt-10 text-center border-t border-cyan-500/10 space-y-4 text-cyan-200">
          <div className="flex justify-center gap-6 text-sm text-cyan-300">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="text-cyan-300 text-xl font-semibold">TimeByCity</div>

          <div className="text-xs text-gray-500">
            Data: Open-Meteo Weather API • Time zones: IANA standard •
            Coordinates include latitude and longitude.
          </div>

          <div className="text-[10px] text-gray-600">
            This site is for informational purposes only. Weather data may vary
            slightly from local sources.
          </div>
        </footer>
      </main>
    </div>
  );
}
