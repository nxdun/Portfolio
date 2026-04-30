import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) =>
  `
# OpenAI
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: OAI-SearchBot
Disallow: /

# Anthropic (Claude)
User-agent: Anthropic-ai
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: CCBot
Disallow: /

# Google AI & Extended Training
User-agent: Google-Extended
Disallow: /

# Meta / Facebook AI
User-agent: FacebookBot
Disallow: /

# Perplexity
User-agent: PerplexityBot
Disallow: /

# Other known scrapers & data miners
User-agent: Omgilibot
Disallow: /

User-agent: Omgili
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: Cohere-training
Disallow: /

User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`.trim();

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
