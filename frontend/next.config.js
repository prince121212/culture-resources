/** @type {import('next').NextConfig} */
const nextConfig = {
  // 这里可以添加其他 Next.js 支持的配置项
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5001',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;