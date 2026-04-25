import fs from "fs";
import path from "path";
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
};

function safeParseCities(): City[] {
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
  const cities = safeParseCities();

  const cityPages = cities.map((city) => {
    const slug = generateCitySlug(city);

    return {
      url: `https://timebycity.net/city/${slug}`,
      // ✅ FIX: stable SEO date (not per-build random)
      lastModified: new Date("2026-01-01"),
    };
  });

  return [
    {
      url: "https://timebycity.net",
      lastModified: new Date("2026-01-01"),
    },
    ...cityPages,
  ];
}
