import fs from "fs";
import path from "path";
import { generateCitySlug } from "@/lib/slugs";

const DATA_PATH = path.join(process.cwd(), "public/cities_search_final.json");

function getCities() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

const CHUNK_SIZE = 10000; // safe + fast

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 0);

  const cities = getCities();

  const start = page * CHUNK_SIZE;
  const slice = cities.slice(start, start + CHUNK_SIZE);

  const urls = slice
    .map((city: any) => {
      const slug = generateCitySlug(city);
      return `
<url>
  <loc>https://timebycity.net/city/${slug}</loc>
  <lastmod>${new Date().toISOString()}</lastmod>
</url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
