import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  async redirects() {
    return [
      { source: '/blog', destination: '/aktualne', permanent: true },
      { source: '/blog/:slug', destination: '/aktualne/:slug', permanent: true },
    ];
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
