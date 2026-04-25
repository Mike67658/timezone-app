import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { generateCitySlug } from "@/lib/slugs";

const DATA_PATH = path.join(process.cwd(), "public/cities_search_final.json");

type City = {
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lng: number;
  timezone?: string;
  slug?: string;
};

function getCities(): City[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    return data.map((c: any) => ({
      ...c,
      lat: Number(c.lat),
      lng: Number(c.lng),
    }));
  } catch {
    return [];
  }
}

function findCityBySlug(slug: string, cities: City[]) {
  return cities.find((c) => generateCitySlug(c) === slug);
}

async function getWeather(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`,
      { cache: "no-store" }
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

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cities = getCities();
  const city = findCityBySlug(slug, cities);

  if (!city) return notFound();

  const weather = await getWeather(city.lat, city.lng);

  const now = new Date();

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
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-[#050814] text-white flex">

      {/* LEFT ADS (MATCH HOME) */}
      <aside className="w-[52px] md:w-[120px] bg-black/30 border-r border-blue-500/10 flex flex-col gap-4 items-center py-4">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="w-full h-[180px] border border-dashed border-blue-500/20 text-[10px] flex items-center justify-center text-gray-400"
          >
            Ad
          </div>
        ))}
      </aside>

      {/* MAIN (MATCH HOME STRUCTURE) */}
      <main className="flex-1 px-4 py-6 space-y-6">

        {/* CITY PANEL (styled like selectedCity block) */}
        <div className="p-6 bg-black/40 border border-cyan-500/20 rounded-xl">

          <div className="text-3xl font-bold">
            🌍 {city.name}
          </div>

          <div className="text-5xl font-mono text-cyan-300 mt-2">
            {time}
          </div>

          <div className="text-sm text-gray-400">
            {date}
          </div>

          {weather && (
            <div className="mt-3 text-gray-300">
              {Math.round(weather.temperature)}°C / {toF(weather.temperature)}°F •{" "}
              {weatherCodeToText(weather.weathercode)}
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2">
            LAT-{city.lat.toFixed(2)} LONG-{city.lng.toFixed(2)}
          </div>

        </div>

        {/* MINI SEARCH (like homepage input) */}
        <div className="text-sm text-gray-500">
          Use search on homepage to switch cities
        </div>

        {/* FEATURED BLOCK (same layout as home) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {cities.slice(0, 9).map((c, i) => {
            const t = new Date().toLocaleTimeString("en-US", {
              timeZone: c.timezone,
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <div
                key={i}
                className="p-5 bg-black/30 border border-blue-500/10 rounded-xl"
              >
                <div>{c.name}</div>

                <div className="text-xl font-mono text-cyan-300">
                  {t}
                </div>

                <div className="text-xs text-gray-400">
                  {c.country} {c.state}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  LAT-{c.lat.toFixed(2)} LONG-{c.lng.toFixed(2)}
                </div>
              </div>
            );
          })}

        </div>

      </main>

      {/* RIGHT ADS (MATCH HOME) */}
      <aside className="w-[52px] md:w-[120px] bg-black/30 border-l border-blue-500/10 flex flex-col gap-4 items-center py-4">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="w-full h-[180px] border border-dashed border-blue-500/20 text-[10px] flex items-center justify-center text-gray-400"
          >
            Ad
          </div>
        ))}
      </aside>

    </div>
  );
}
