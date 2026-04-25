import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { resolveCity } from "@/lib/cities";
import { generateCitySlug } from "@/lib/slugs";

const DATA_PATH = path.join(
  process.cwd(),
  "public/cities_search_final.json"
);

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
 * Load dataset safely (single source of truth)
 */
function loadCities(): City[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) return [];

    return data
      .map((c: any) => ({
        ...c,
        lat: Number(c.lat),
        lng: Number(c.lng),
        slug: c.slug || generateCitySlug(c),
      }))
      .filter((c) => c.name && !Number.isNaN(c.lat) && !Number.isNaN(c.lng));
  } catch {
    return [];
  }
}

/**
 * ⚠️ SAFE SAVE (works locally, ignored on Vercel runtime)
 */
function trySaveCity(city: City) {
  try {
    if (process.env.VERCEL) return false; // ❗ prevent silent failure in prod

    if (!fs.existsSync(DATA_PATH)) return false;

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    const exists = data.some(
      (c: City) =>
        c.name?.toLowerCase() === city.name?.toLowerCase()
    );

    if (exists) return true;

    const safeCity: City = {
      name: city.name,
      country: city.country,
      state: city.state,
      lat: Number(city.lat),
      lng: Number(city.lng),
      timezone: city.timezone,
      slug: generateCitySlug(city),
    };

    data.push(safeCity);

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    return true;
  } catch {
    return false;
  }
}

/**
 * POST /api/discover-city
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body?.query;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid query" },
        { status: 400 }
      );
    }

    // unified dataset loader
    const cities = loadCities();

    const city = await resolveCity(query, cities);

    if (!city) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      );
    }

    const saved = trySaveCity(city);

    return NextResponse.json({
      success: true,
      city,
      saved,
    });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
