/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Ignorar errores de ESLint en build (Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: ['randomuser.me'],
  },
};

module.exports = nextConfig;
