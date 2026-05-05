import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Tree-shake heavy icon/chart packages — importuje jen použité symboly
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async redirects() {
    return [
      { source: '/blog', destination: '/aktualne', permanent: true },
      { source: '/blog/:slug', destination: '/aktualne/:slug', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/data/:file*.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=7200' },
        ],
      },
      {
        // Statické JS/CSS chunky — immutable cache (Next.js obsah hash v názvu)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
