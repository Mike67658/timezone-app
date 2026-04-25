import fs from "fs";
import path from "path";
import { generateCitySlug } from "@/lib/slugs";

const DATA_PATH = path.join(process.cwd(), "public/cities_search_final.json");

type City = {
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lng: number;
};

export default function sitemap() {
  let cities: City[] = [];

  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    cities = JSON.parse(raw);
  } catch {}

  const cityPages = cities.map((city) => ({
    url: `https://timebycity.net/city/${generateCitySlug(city)}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "https://timebycity.net",
      lastModified: new Date(),
    },
    ...cityPages,
  ];
}
