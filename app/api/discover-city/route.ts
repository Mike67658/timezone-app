import { NextResponse } from "next/server";
import { resolveCity } from "@/lib/cities";
import citiesData from "../../../public/cities_search_final.json";

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
 * ⚠️ Vercel-safe version:
 * - NO filesystem writes (serverless restriction)
 * - still supports dynamic discovery
 */
function trySaveCity(city: City) {
  // Disabled intentionally for Vercel compatibility
  // If you need persistence, use DB (Supabase / Redis / PlanetScale)
  return false;
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

    // Use static import instead of dynamic fs read
    const cities: City[] = citiesData as City[];

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

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
