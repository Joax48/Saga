/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true, // 👈 agrega esto
  },

  images: {
    domains: ['randomuser.me', 'ui-avatars.com'],
  },
};

module.exports = nextConfig;
