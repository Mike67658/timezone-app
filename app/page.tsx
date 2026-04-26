"use client";

import { useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { generateCitySlug } from "@/lib/slugs";

const INITIAL_FEATURED_CITIES = [
  { name: "Manila", timezone: "Asia/Manila", emoji: "🇵🇭", lat: 14.5995, lng: 120.9842 },
  { name: "Tokyo", timezone: "Asia/Tokyo", emoji: "🇯🇵", lat: 35.6762, lng: 139.6503 },
  { name: "New York", timezone: "America/New_York", emoji: "🇺🇸", lat: 40.7128, lng: -74.006 },
  { name: "London", timezone: "Europe/London", emoji: "🇬🇧", lat: 51.5072, lng: -0.1276 },
  { name: "Dubai", timezone: "Asia/Dubai", emoji: "🇦🇪", lat: 25.2048, lng: 55.2708 },
  { name: "Los Angeles", timezone: "America/Los_Angeles", emoji: "🇺🇸", lat: 34.0522, lng: -118.2437 },
  { name: "Mexico City", timezone: "America/Mexico_City", emoji: "🇲🇽", lat: 19.4326, lng: -99.1332 },
  { name: "Cape Town", timezone: "Africa/Johannesburg", emoji: "🇿🇦", lat: -33.9249, lng: 18.4241 },
  { name: "Bangkok", timezone: "Asia/Bangkok", emoji: "🇹🇭", lat: 13.7563, lng: 100.5018 },
];

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

export default function Home() {
  const router = useRouter();

  const [allCities, setAllCities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);

  const [clocks, setClocks] = useState<Record<string, string>>({});
  const [weather, setWeather] = useState<any | null>(null);
  const [weatherMap, setWeatherMap] = useState<Record<string, any>>({});

  const fuseRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetch("/cities_search_final.json").then(r => r.json());
      setAllCities(data);

      fuseRef.current = new Fuse(data, {
        keys: ["name", "country", "state", "search"],
        threshold: 0.25,
      });

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const match = data.find((c: any) => c.timezone === tz);
      if (match) setSelectedCity(match);
    };

    load();
  }, []);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();
      setWeather(data.current_weather);
    } catch {}
  };

  useEffect(() => {
    const run = async () => {
      const map: any = {};

      await Promise.all(
        INITIAL_FEATURED_CITIES.map(async (c) => {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current_weather=true`
          );
          const data = await res.json();
          map[c.name] = data.current_weather;
        })
      );

      setWeatherMap(map);
    };

    run();
    const i = setInterval(run, 600000);
    return () => clearInterval(i);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchQuery(v);

    clearTimeout(debounceRef.current);

    if (!v || v.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (!fuseRef.current) return;

      const localResults = fuseRef.current
        .search(v)
        .slice(0, 8)
        .map((r: any) => r.item);

      setResults(localResults);
    }, 70);
  };

  const handleCityClick = (city: any) => {
    setSelectedCity(city);
    setSearchQuery("");
    setResults([]);
    fetchWeather(city.lat, city.lng);

    const slug = generateCitySlug(city);
    router.push(`/city/${slug}`);
  };

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const out: any = {};

      const zones = [
        ...INITIAL_FEATURED_CITIES.map(c => c.timezone),
        ...(selectedCity ? [selectedCity.timezone] : []),
      ];

      for (const tz of zones) {
        try {
          out[tz] = now.toLocaleTimeString("en-US", {
            timeZone: tz,
            hour: "numeric",
            minute: "2-digit",
          });
        } catch {}
      }

      setClocks(out);
    };

    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [selectedCity]);

  const formatDate = (tz: string) =>
    new Date().toLocaleDateString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#050814] text-white flex">

      {/* LEFT ADS */}
      <aside className="w-[52px] md:w-[120px] bg-black/30 border-r border-cyan-500/20 flex flex-col gap-4 items-center py-4">
        {[1,2,3,4,5,6,7,8,9].map(i => (
          <div key={i} className="w-full h-[180px] border border-dashed border-cyan-400/30 text-[10px] flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            Ad
          </div>
        ))}
      </aside>

      <main className="flex-1 px-4 py-6 space-y-8">

        <input
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search any city..."
          className="w-full p-5 text-xl rounded-2xl bg-black/40 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
        />

        {results.map((city, i) => (
          <div
            key={i}
            onClick={() => handleCityClick(city)}
            className="p-5 bg-black/30 border border-cyan-500/20 rounded-xl cursor-pointer shadow-[0_0_25px_rgba(34,211,238,0.10)]"
          >
            <div className="text-lg font-semibold text-cyan-200">{city.name}</div>
            <div className="text-sm text-gray-400">{city.country} • {city.state}</div>
            <div className="text-xs text-gray-500 mt-1">
              LAT-{city.lat?.toFixed(2)} LONG-{city.lng?.toFixed(2)}
            </div>
          </div>
        ))}

        {selectedCity && (
          <div className="p-6 bg-black/40 border border-cyan-400/30 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.15)]">

            <div className="text-3xl font-bold text-cyan-200">{selectedCity.name}</div>

            <div className="text-5xl font-mono text-cyan-300 mt-2">
              {clocks[selectedCity.timezone]}
            </div>

            <div className="text-sm text-gray-400">
              {formatDate(selectedCity.timezone)}
            </div>

            {weather && (
              <div className="mt-3 text-gray-300">
                {Math.round(weather.temperature)}°C / {toF(weather.temperature)}°F •{" "}
                {weatherCodeToText(weather.weathercode)}
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
              LAT-{selectedCity.lat?.toFixed(2)} LONG-{selectedCity.lng?.toFixed(2)}
            </div>

          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_FEATURED_CITIES.map((c, i) => {
            const w = weatherMap[c.name];

            return (
              <div key={i} className="p-5 bg-black/30 border border-cyan-400/20 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.10)]">

                <div className="text-cyan-200">{c.emoji} {c.name}</div>

                <div className="text-xl font-mono text-cyan-300">
                  {clocks[c.timezone]}
                </div>

                <div className="text-xs text-gray-400">
                  {formatDate(c.timezone)}
                </div>

                {w && (
                  <div className="text-xs text-gray-300 mt-1">
                    {Math.round(w.temperature)}°C / {toF(w.temperature)}°F
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-1">
                  LAT-{c.lat.toFixed(2)} LONG-{c.lng.toFixed(2)}
                </div>

              </div>
            );
          })}
        </div>

        {/* FOOTER (WITH RESTORED TRUST + CREDIT SECTION) */}
        <div className="pt-10 text-center border-t border-cyan-500/10 mt-10 space-y-4">

          <div className="text-cyan-300 font-semibold text-lg">
            Explore
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-cyan-200">
            <button onClick={() => router.push("/about")}>About</button>
            <button onClick={() => router.push("/privacy")}>Privacy</button>
            <button onClick={() => router.push("/terms")}>Terms</button>
            <button onClick={() => router.push("/contact")}>Contact</button>
          </div>

          <div className="text-lg text-cyan-200 mt-6">
            What time is it in Manila? Tokyo? New York?
          </div>

          <div className="text-2xl font-bold text-cyan-300">
            We have the answer.
          </div>

          <div className="text-sm text-gray-300 space-y-1">
            <div>Search any city worldwide instantly</div>
            <div>Accurate timezone + weather data</div>
            <div>No login required</div>
            <div>Updated continuously</div>
          </div>

          <div className="text-cyan-300 mt-6 text-xl font-semibold">
            TimeByCity
          </div>

          {/* RESTORED CREDITS */}
          <div className="text-xs text-gray-500 mt-3">
            Data source: Open-Meteo Weather API • Time zones: IANA database
          </div>

          <div className="text-[10px] text-gray-600 mt-2">
            Weather data provided for informational purposes only. No user data is stored or tracked.
          </div>

        </div>

      </main>

      {/* RIGHT ADS */}
      <aside className="w-[52px] md:w-[120px] bg-black/30 border-l border-cyan-500/20 flex flex-col gap-4 items-center py-4">
        {[1,2,3,4,5,6,7,8,9].map(i => (
          <div key={i} className="w-full h-[180px] border border-dashed border-cyan-400/30 text-[10px] flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            Ad
          </div>
        ))}
      </aside>

    </div>
  );
}
