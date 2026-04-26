export default function sitemap() {
  const now = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <sitemap>
    <loc>https://timebycity.net/sitemap/cities-0.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>

  <sitemap>
    <loc>https://timebycity.net/sitemap/cities-1.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>

  <sitemap>
    <loc>https://timebycity.net/sitemap/cities-2.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>

  <sitemap>
    <loc>https://timebycity.net/sitemap/cities-3.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>

  <sitemap>
    <loc>https://timebycity.net/sitemap/cities-4.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>

</sitemapindex>`;
}
