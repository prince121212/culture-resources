/** @type {import('next').NextConfig} */
const nextConfig = {
  // 指定源代码目录
  experimental: {
    appDir: true,
  },
  // 禁用 turbopack
  turbo: {
    enabled: false,
  },
};

module.exports = nextConfig;
