import fs from "fs";
import path from "path";

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

  const CHUNK_SIZE = 40000;

  const chunks = Math.ceil(cities.length / CHUNK_SIZE);

  return [
    {
      url: "https://timebycity.net",
      lastModified: new Date("2026-01-01"),
    },

    // 👇 FIXED: matches your /sitemap/cities/[page] route
    ...Array.from({ length: chunks }).map((_, i) => ({
      url: `https://timebycity.net/sitemap/cities/${i}`,
      lastModified: new Date("2026-01-01"),
    })),
  ];
}
