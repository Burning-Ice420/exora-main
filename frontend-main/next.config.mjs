/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      // Auth
      {
        source: '/login',
        destination: 'https://beta.exora.in/login',
      },
      {
        source: '/signup',
        destination: 'https://beta.exora.in/signup',
      },
      // App routes
      {
        source: '/feed/:path*',
        destination: 'https://beta.exora.in/feed/:path*',
      },
      {
        source: '/labs/:path*',
        destination: 'https://beta.exora.in/labs/:path*',
      },
      // Optional catch-all for other app paths
      {
        source: '/app/:path*',
        destination: 'https://beta.exora.in/:path*',
      },
    ];
  },
};

export default nextConfig;
