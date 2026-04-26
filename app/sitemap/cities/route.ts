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

function getCities(): City[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    return data.map((c: any) => ({
      ...c,
      lat: Number(c.lat),
      lng: Number(c.lng),
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const cities = getCities();

  const urls = cities
    .map((city) => {
      const slug = generateCitySlug(city);

      return `
<url>
  <loc>https://timebycity.net/city/${slug}</loc>
  <lastmod>${new Date().toISOString()}</lastmod>
</url>
      `.trim();
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
