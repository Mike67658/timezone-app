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

function getCities(): City[] {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export default function sitemap() {
  const cities = getCities();

  const cityPages = cities.map((city: City) => ({
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
