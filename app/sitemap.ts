import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "public/cities_search_final.json");

// 🔥 Change ONLY when you rebuild cities dataset
const LAST_MODIFIED = new Date("2026-04-26");

const BASE_URL = "https://timebycity.net";
const CHUNK_SIZE = 50000;

type City = {
  name: string;
};

function getCityCount(): number {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) return 0;

    return data.filter(
      (c) => c && typeof c.name === "string"
    ).length;
  } catch {
    return 0;
  }
}

export default function sitemap() {
  const cityCount = getCityCount();

  // +1 homepage URL lives in sitemap.xml, so cities must stay under limit
  const totalChunks = Math.ceil(cityCount / CHUNK_SIZE);

  const chunkSitemaps = Array.from({ length: totalChunks }, (_, i) => ({
    url: `${BASE_URL}/sitemap/cities?page=${i}`,
    lastModified: LAST_MODIFIED,
  }));

  return [
    {
      url: `${BASE_URL}`,
      lastModified: LAST_MODIFIED,
    },
    ...chunkSitemaps,
  ];
}
