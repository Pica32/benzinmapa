import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statický export – funguje na Wedos sdíleném hostingu (bez Node.js)
  output: 'export',
  trailingSlash: true,
  images: {
    // Pro statický export musíme vypnout optimalizaci obrázků (není dostupný server)
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
