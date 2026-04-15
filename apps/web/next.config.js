/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //todo(delete this line)
  images: {
    domains: ['randomuser.me', 'ui-avatars.com'],
  },
};

module.exports = nextConfig;
