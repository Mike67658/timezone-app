export default function sitemapIndex() {
  const totalChunks = 5; // you can increase later

  return [
    {
      url: "https://timebycity.net/sitemap/cities-0.xml",
      lastModified: new Date(),
    },
    {
      url: "https://timebycity.net/sitemap/cities-1.xml",
      lastModified: new Date(),
    },
    {
      url: "https://timebycity.net/sitemap/cities-2.xml",
      lastModified: new Date(),
    },
    {
      url: "https://timebycity.net/sitemap/cities-3.xml",
      lastModified: new Date(),
    },
    {
      url: "https://timebycity.net/sitemap/cities-4.xml",
      lastModified: new Date(),
    },
  ];
}
