import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
# As a condition of accessing this website, you agree to abide by the following content signals:
# search:   building a search index and providing search results (not AI summaries)
# ai-input: inputting content into AI models for real-time generative answers (e.g., RAG)
# ai-train: training or fine-tuning AI models
# Breaking these conditions may result to autoamatic blocking of your crawler.

User-agent: *
Content-Signal: search=no,ai-input=no,ai-train=no
Disallow: /

User-agent: Googlebot
Content-Signal: search=yes,ai-input=no,ai-train=no
Allow: /

User-agent: Googlebot-Image
Content-Signal: search=yes,ai-input=no,ai-train=no
Allow: /

User-agent: Bingbot
Content-Signal: search=yes,ai-input=no,ai-train=no
Allow: /

User-agent: Slurp
Content-Signal: search=yes,ai-input=no,ai-train=no
Allow: /

User-agent: DuckDuckBot
Content-Signal: search=yes,ai-input=no,ai-train=no
Allow: /

User-agent: Baiduspider
Content-Signal: search=yes,ai-input=no,ai-train=no
Allow: /

User-agent: YandexBot
Content-Signal: search=yes,ai-input=no,ai-train=no
Allow: /

Sitemap: ${sitemapURL.href}
`;
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};


