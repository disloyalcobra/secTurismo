import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permite cargar las imágenes de seed que viven en Unsplash.
    // Las nuevas subidas se almacenan en Vercel Blob (URL absoluta), por
    // lo que no requieren estar aquí.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
