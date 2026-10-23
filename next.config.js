/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { viewTransition: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 100],
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
  async redirects() {
    return [
      { source: '/support', destination: '/families', permanent: true },
      { source: '/support/:path*', destination: '/families/:path*', permanent: true },
      { source: '/families/next-steps', destination: '/families', permanent: true },
    ];
  },
};
module.exports = nextConfig;
