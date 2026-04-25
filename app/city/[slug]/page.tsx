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
    return JSON.parse(raw);
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
    return data.current_weather;
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

/**
 * ✅ FIX: params is now a Promise in Next.js 16+
 */
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
    : "";

  const date = city.timezone
    ? now.toLocaleDateString("en-US", {
        timeZone: city.timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-[#050814] text-white px-6 py-10">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold">
          🌍 {city.name}
        </h1>

        <p className="text-gray-400 mt-1">
          {city.country} {city.state ? `• ${city.state}` : ""}
        </p>

        <div className="text-5xl font-mono text-cyan-300 mt-6">
          {time}
        </div>

        <div className="text-sm text-gray-400 mt-1">
          {date}
        </div>

        {weather && (
          <div className="mt-6 p-4 rounded-xl bg-black/40 border border-blue-500/20">
            <div className="text-xl">
              {Math.round(weather.temperature)}°C / {toF(weather.temperature)}°F
            </div>

            <div className="text-gray-300">
              {weatherCodeToText(weather.weathercode)}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          LAT-{city.lat.toFixed(2)} LONG-{city.lng.toFixed(2)}
        </div>

        {/* SEO TEXT */}
        <div className="mt-10 text-gray-300 leading-relaxed">
          <p>
            Current local time in {city.name}, {city.country} is shown above.
            This page provides live time, weather conditions, and geographic data.
          </p>

          <p className="mt-4">
            Explore timezone tracking and live global city data.
          </p>
        </div>

      </div>

    </div>
  );
}
