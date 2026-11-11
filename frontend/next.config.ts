import path from 'path';
import type { NextConfig } from 'next';

const ADMIN_URL = (process.env.ADMIN_URL || 'http://localhost:3001').replace(/\/$/, '');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  async redirects() {
    return [
      { source: '/admin', destination: ADMIN_URL, permanent: false },
      { source: '/admin/:path*', destination: `${ADMIN_URL}/:path*`, permanent: false },
    ];
  },
};

export default nextConfig;
