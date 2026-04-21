/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Otimizações para mobile
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // PWA básico
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
