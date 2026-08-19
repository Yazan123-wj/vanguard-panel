import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The CMS proxy forwards Django paths verbatim, and Django requires the
  // trailing slash. Without this every admin API call eats a 308 first.
  skipTrailingSlashRedirect: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
