/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bilvipp — Trader Terminal redesign
  // Static car data is copied from /data/ to /public/data/ at build time
  // (see scripts/copy-data.mjs). Real auth, real images, etc. come later.
  images: {
    // finn.no CDN serves all listing photos. We hotlink and let Next.js
    // Image Optimization transcode/resize to WebP/AVIF for srcset.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.finncdn.no',
        pathname: '/dynamic/**',
      },
    ],
  },
};

export default nextConfig;
