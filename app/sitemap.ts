import fs from "fs";
import path from "path";
import { generateCitySlug } from "@/lib/slugs";

const DATA_PATH = path.join(process.cwd(), "public/cities_search_final.json");

// 🔥 Set-and-forget SEO timestamp (ONLY change when you rebuild cities)
const LAST_MODIFIED = new Date("2026-04-26");

type City = {
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lng: number;
};

function getCities(): City[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) return [];

    return data
      .filter((c) => c && typeof c.name === "string")
      .map((c) => ({
        name: c.name,
        country: c.country,
        state: c.state,
        lat: Number(c.lat),
        lng: Number(c.lng),
      }))
      .filter((c) => !Number.isNaN(c.lat) && !Number.isNaN(c.lng));
  } catch {
    return [];
  }
}

export default function sitemap() {
  const cities = getCities();

  const cityPages = cities.map((city: City) => ({
    url: `https://timebycity.net/city/${generateCitySlug(city)}`,
    lastModified: LAST_MODIFIED,
  }));

  return [
    {
      url: "https://timebycity.net",
      lastModified: LAST_MODIFIED,
    },
    ...cityPages,
  ];
}
