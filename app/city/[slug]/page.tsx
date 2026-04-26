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

      {/* LEFT ADS */}
      <aside className="w-[52px] md:w-[120px] bg-black/30 border-r border-cyan-500/20 flex flex-col gap-4 items-center py-4">
        {[1,2,3,4,5,6,7,8,9].map(i => (
          <div
            key={i}
            className="w-full h-[180px] border border-dashed border-cyan-400/30 text-[10px] flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            Ad
          </div>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-4 py-6 space-y-6">

        {/* CITY PANEL */}
        <div className="p-6 bg-black/40 border border-cyan-400/30 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.15)]">

          <div className="text-3xl font-bold text-cyan-200">
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

        {/* MINI TEXT */}
        <div className="text-sm text-gray-500">
          Use search on homepage to switch cities
        </div>

        {/* FEATURE GRID */}
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
                className="p-5 bg-black/30 border border-cyan-500/20 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.10)]"
              >
                <div className="text-cyan-200">{c.name}</div>

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

        {/* 🔥 FOOTER */}
        <div className="pt-14 text-center space-y-4 text-cyan-200">

          <div className="text-lg text-cyan-300">
            What time is it in {city.name}?
          </div>

          <div className="text-2xl font-bold text-cyan-200 mt-4">
            We have the answer.
          </div>

          <div className="text-sm text-gray-300 space-y-1 mt-4">
            <div>Search any city worldwide instantly</div>
            <div>Accurate timezone + weather data</div>
            <div>No login required</div>
            <div>Updated continuously</div>
          </div>

          {/* NAV TABS ADDED */}
          <div className="flex justify-center gap-6 text-sm text-cyan-300 mt-6">
            <a href="/about" className="hover:text-cyan-100">About</a>
            <a href="/privacy" className="hover:text-cyan-100">Privacy</a>
            <a href="/terms" className="hover:text-cyan-100">Terms</a>
            <a href="/contact" className="hover:text-cyan-100">Contact</a>
          </div>

          <div className="text-cyan-300 mt-6 text-xl font-semibold">
            TimeByCity
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Data: Open-Meteo Weather API • Time zones: IANA standard
          </div>

          <div className="text-[10px] text-gray-600 mt-4">
            This site is for informational purposes only. Weather data may vary slightly from local sources.
          </div>

        </div>

      </main>

      {/* RIGHT ADS */}
      <aside className="w-[52px] md:w-[120px] bg-black/30 border-l border-cyan-500/20 flex flex-col gap-4 items-center py-4">
        {[1,2,3,4,5,6,7,8,9].map(i => (
          <div
            key={i}
            className="w-full h-[180px] border border-dashed border-cyan-400/30 text-[10px] flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            Ad
          </div>
        ))}
      </aside>

    </div>
  );
}
