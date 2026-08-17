/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3005/api/:path*'
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3005/uploads/:path*'
      }
    ];
  }
};

export default nextConfig;
