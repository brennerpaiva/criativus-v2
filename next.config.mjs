/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.fbcdn.net', // cobre scontent-gru1-1.xx.fbcdn.net, etc.
      },
      {
        protocol: 'https',
        hostname: 'static.rocketreach.co',
      },
      {
        protocol: 'https',
        hostname: '*.facebook.com', // se precisar de qualquer subdomínio do facebook.com
      },
    ],
  },
};

export default nextConfig;
