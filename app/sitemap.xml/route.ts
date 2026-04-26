import fs from "fs";
import path from "path";

const DATA_PATH = path.join(
  process.cwd(),
  "public/cities_search_final.json"
);

const BASE_URL = "https://timebycity.net";
const CHUNK_SIZE = 50000;
const LAST_MODIFIED = "2026-04-26";

function getCityCount() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) return 0;

    return data.length;
  } catch {
    return 0;
  }
}

export async function GET() {
  const cityCount = getCityCount();
  const totalChunks = Math.ceil(cityCount / CHUNK_SIZE);

  const items = Array.from({ length: totalChunks }, (_, i) => `
<sitemap>
  <loc>${BASE_URL}/sitemap/cities?page=${i}</loc>
  <lastmod>${LAST_MODIFIED}</lastmod>
</sitemap>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap>
  <loc>${BASE_URL}/</loc>
  <lastmod>${LAST_MODIFIED}</lastmod>
</sitemap>
${items}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
