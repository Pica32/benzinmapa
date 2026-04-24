import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // AI vyhledávače — explicitní povolení pro lepší indexaci
      { userAgent: 'GPTBot',        allow: '/' },
      { userAgent: 'ChatGPT-User',  allow: '/' },
      { userAgent: 'ClaudeBot',     allow: '/' },
      { userAgent: 'anthropic-ai',  allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'CCBot',         allow: '/' },
      { userAgent: 'Googlebot',     allow: '/' },
      { userAgent: 'bingbot',       allow: '/' },
    ],
    sitemap: 'https://benzinmapa.cz/sitemap.xml',
    host: 'https://benzinmapa.cz',
  };
}
