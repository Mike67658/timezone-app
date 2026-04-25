import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { resolveCity } from "@/lib/cities";

const DATA_PATH = path.join(process.cwd(), "public/cities_search_final.json");

/**
 * Safely append city to local JSON (ONLY works on self-hosted environments)
 */
function trySaveCity(city: any) {
  try {
    if (!fs.existsSync(DATA_PATH)) return false;

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    // prevent duplicates
    const exists = data.some(
      (c: any) => c.name.toLowerCase() === city.name.toLowerCase()
    );

    if (exists) return true;

    data.push(city);

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    return true;
  } catch {
    return false;
  }
}

/**
 * POST /api/discover-city
 * Body: { query: string }
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

    // load current dataset
    const cities = await import("../../../public/cities_search_final.json").then(
      (m) => m.default
    );

    // resolve city (local → geocode fallback)
    const city = await resolveCity(query, cities);

    if (!city) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      );
    }

    // OPTIONAL AUTO-SAVE (your “self-growing database” system)
    const saved = trySaveCity(city);

    return NextResponse.json({
      success: true,
      city,
      saved,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
