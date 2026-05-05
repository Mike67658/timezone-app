"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateCitySlug } from "@/lib/slugs";

const INITIAL_FEATURED_CITIES = [
  { name: "Manila", timezone: "Asia/Manila", emoji: "🇵🇭", lat: 14.5995, lng: 120.9842, country: "PH", state: "" },
  { name: "Tokyo", timezone: "Asia/Tokyo", emoji: "🇯🇵", lat: 35.6762, lng: 139.6503, country: "JP", state: "" },
  { name: "New York City", timezone: "America/New_York", emoji: "🇺🇸", lat: 40.7128, lng: -74.006, country: "US", state: "NY" },
  { name: "London", timezone: "Europe/London", emoji: "🇬🇧", lat: 51.5072, lng: -0.1276, country: "GB", state: "" },
  { name: "Dubai", timezone: "Asia/Dubai", emoji: "🇦🇪", lat: 25.2048, lng: 55.2708, country: "AE", state: "" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", emoji: "🇺🇸", lat: 34.0522, lng: -118.2437, country: "US", state: "CA" },
  { name: "Mexico City", timezone: "America/Mexico_City", emoji: "🇲🇽", lat: 19.4326, lng: -99.1332, country: "MX", state: "" },
  { name: "Cape Town", timezone: "Africa/Johannesburg", emoji: "🇿🇦", lat: -33.9249, lng: 18.4241, country: "ZA", state: "" },
  { name: "Bangkok", timezone: "Asia/Bangkok", emoji: "🇹🇭", lat: 13.7563, lng: 100.5018, country: "TH", state: "" },
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

function AdSlot({ label }: { label: string }) {
  return (
    <div className="min-h-[120px] rounded-xl border border-cyan-500/10 bg-black/20 flex items-center justify-center text-xs text-gray-600">
      Advertisement Placeholder — {label}
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  const [allCities, setAllCities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [clocks, setClocks] = useState<Record<string, string>>({});
  const [weatherMap, setWeatherMap] = useState<Record<string, any>>({});

  const fuseRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetch("/cities_search_final.json").then((r) => r.json());
      setAllCities(data);

      fuseRef.current = new Fuse(data, {
        keys: ["name", "country", "state", "search", "timezone"],
        threshold: 0.25,
      });

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const match = data.find((c: any) => c.timezone === tz);
      if (match) setSelectedCity(match);
    };

    load();
  }, []);

  const popularCities = useMemo(() => {
    if (!allCities.length) return INITIAL_FEATURED_CITIES;

    return INITIAL_FEATURED_CITIES.map((featured) => {
      const match = allCities.find(
        (city: any) =>
          city.name === featured.name &&
          city.timezone === featured.timezone
      );

      return match || featured;
    });
  }, [allCities]);

  useEffect(() => {
    const run = async () => {
      const map: any = {};

      await Promise.all(
        INITIAL_FEATURED_CITIES.map(async (c) => {
          try {
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current_weather=true`
            );
            const data = await res.json();
            map[c.name] = data.current_weather;
          } catch {}
        })
      );

      setWeatherMap(map);
    };

    run();
    const i = setInterval(run, 600000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const out: any = {};

      const zones = [
        ...INITIAL_FEATURED_CITIES.map((c) => c.timezone),
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
        .slice(0, 10)
        .map((r: any) => r.item);

      setResults(localResults);
    }, 70);
  };

  const handleCityClick = (city: any) => {
    setSelectedCity(city);
    setSearchQuery("");
    setResults([]);

    const slug = generateCitySlug(city);
    router.push(`/city/${slug}`);
  };

  const formatDate = (tz: string) =>
    new Date().toLocaleDateString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">

        <section className="text-center py-8 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-cyan-300">
            Find the Current Time in Any City
          </h1>

          <p className="max-w-3xl mx-auto text-gray-300 text-lg leading-relaxed">
            TimeByCity helps you search cities worldwide and instantly check the
            current local time, date, time zone, weather, latitude, and longitude.
          </p>
        </section>

        <section className="space-y-2">
          <input
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search any city..."
            className="w-full p-5 text-xl rounded-2xl bg-black/40 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          />

          <div className="flex flex-col gap-[2px]">
            {results.map((city, i) => (
              <button
                key={i}
                onClick={() => handleCityClick(city)}
                className="text-left px-3 py-2 cursor-pointer hover:bg-cyan-500/10 transition rounded-lg"
              >
                <div className="flex items-center gap-2 text-sm leading-tight">
                  <span className="text-cyan-200 font-medium">
                    {city.name}
                  </span>

                  <span className="text-gray-400 text-xs">
                    {city.country} {city.state ? `• ${city.state}` : ""} •{" "}
                    {city.timezone}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <AdSlot label="Homepage Top" />

        {selectedCity && (
          <section className="p-6 bg-black/40 border border-cyan-400/30 rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <div className="text-sm text-gray-400">Your detected time zone</div>

            <div className="text-3xl font-bold text-cyan-200 mt-1">
              {selectedCity.name}
            </div>

            <div className="text-5xl font-mono text-cyan-300 mt-2">
              {clocks[selectedCity.timezone]}
            </div>

            <div className="text-sm text-gray-400">
              {formatDate(selectedCity.timezone)}
            </div>

            <div className="text-sm text-gray-500 mt-2">
              Latitude: {Number(selectedCity.lat).toFixed(4)} • Longitude:{" "}
              {Number(selectedCity.lng).toFixed(4)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">
            Popular City Times
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularCities.map((c: any, i) => {
              const w = weatherMap[c.name];

              return (
                <Link
                  key={i}
                  href={`/city/${generateCitySlug(c as any)}`}
                  className="p-5 bg-black/30 border border-cyan-400/20 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.10)] hover:bg-cyan-500/10 transition"
                >
                  <div className="text-cyan-200 font-semibold">
                    {INITIAL_FEATURED_CITIES[i]?.emoji || "🌍"} {c.name}
                  </div>

                  <div className="text-xl font-mono text-cyan-300 mt-1">
                    {clocks[c.timezone]}
                  </div>

                  <div className="text-xs text-gray-400">
                    {formatDate(c.timezone)}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    {c.timezone}
                  </div>

                  {w && (
                    <div className="text-xs text-gray-300 mt-1">
                      {Math.round(w.temperature)}°C / {toF(w.temperature)}°F •{" "}
                      {weatherCodeToText(w.weathercode)}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-1">
                    LAT {Number(c.lat).toFixed(2)} • LNG {Number(c.lng).toFixed(2)}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl space-y-4 text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-cyan-300">
            Search Local Time, Weather, and Coordinates Worldwide
          </h2>

          <p>
            TimeByCity is built for quick city-based time lookup. You can search
            for a city and view its current local time, date, time zone,
            weather information when available, and latitude and longitude
            coordinates.
          </p>

          <p>
            This is useful for planning calls, checking time before travel,
            comparing cities across different time zones, looking up geographic
            coordinates, or confirming the local time before contacting someone
            in another country.
          </p>

          <p>
            Each city page is designed to provide helpful location details,
            nearby city links, same-time-zone references, and clear information
            about the city&apos;s time and coordinates.
          </p>
        </section>

        <AdSlot label="Homepage Middle" />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl">
            <h3 className="text-xl font-bold text-cyan-300">
              Current Local Time
            </h3>
            <p className="text-gray-300 mt-3">
              Look up the current time and date for cities around the world.
              TimeByCity uses IANA time zone data for city-based time display.
            </p>
          </div>

          <div className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl">
            <h3 className="text-xl font-bold text-cyan-300">
              Latitude and Longitude
            </h3>
            <p className="text-gray-300 mt-3">
              City pages include latitude and longitude coordinates to help with
              map lookup, travel planning, weather location matching, and
              geographic reference.
            </p>
          </div>

          <div className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl">
            <h3 className="text-xl font-bold text-cyan-300">
              Weather When Available
            </h3>
            <p className="text-gray-300 mt-3">
              Weather details are shown when available, including temperature
              and basic conditions, so you can check time and weather in one
              place.
            </p>
          </div>
        </section>

        <section className="p-6 bg-black/30 border border-cyan-400/20 rounded-xl space-y-5 text-gray-300">
          <h2 className="text-2xl font-bold text-cyan-300">
            Frequently Asked Questions
          </h2>

          <div>
            <h3 className="text-cyan-200 font-semibold">
              What can I search on TimeByCity?
            </h3>
            <p>
              You can search for cities worldwide and view local time, date,
              time zone, weather when available, and latitude and longitude.
            </p>
          </div>

          <div>
            <h3 className="text-cyan-200 font-semibold">
              Does TimeByCity show coordinates?
            </h3>
            <p>
              Yes. City pages include latitude and longitude coordinates for
              geographic reference, mapping, travel planning, and weather
              lookup.
            </p>
          </div>

          <div>
            <h3 className="text-cyan-200 font-semibold">
              Why are time zones important?
            </h3>
            <p>
              Time zones help you know the correct local time before scheduling
              calls, planning trips, sending messages, or comparing cities in
              different parts of the world.
            </p>
          </div>

          <div>
            <h3 className="text-cyan-200 font-semibold">
              Is weather always available?
            </h3>
            <p>
              Weather is shown when available from the weather data provider.
              If weather is temporarily unavailable, the city time, date, time
              zone, and coordinates remain available.
            </p>
          </div>
        </section>

        <AdSlot label="Homepage Bottom" />

        <footer className="pt-10 text-center border-t border-cyan-500/10 mt-10 space-y-4">
          <div className="text-cyan-300 font-semibold text-lg">
            Explore TimeByCity
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-cyan-200">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="text-lg text-cyan-200 mt-6">
            What time is it in Manila? Tokyo? New York? London?
          </div>

          <div className="text-2xl font-bold text-cyan-300">
            Search the city. Get the answer.
          </div>

          <div className="text-sm text-gray-300 space-y-1">
            <div>Search cities worldwide instantly</div>
            <div>Current time, date, weather, latitude, and longitude</div>
            <div>No login required</div>
            <div>Updated continuously</div>
          </div>

          <div className="text-cyan-300 mt-6 text-xl font-semibold">
            TimeByCity
          </div>

          <div className="text-xs text-gray-500 mt-3">
            Data source: Open-Meteo Weather API • Time zones: IANA database •
            Coordinates include latitude and longitude
          </div>

          <div className="text-[10px] text-gray-600 mt-2">
            Weather data is provided for informational purposes only. No user
            account is required to use this site.
          </div>
        </footer>

      </main>
    </div>
  );
}
