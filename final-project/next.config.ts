import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // 使用 webpack 配置（禁用 Turbopack）
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // 禁用服務器組件追蹤（Next.js 16 中已移到頂層）
  serverExternalPackages: ['mongoose', 'mongodb'],
  // 禁用構建追蹤以修復 ENOENT 錯誤
  output: undefined, // 不使用 standalone，讓 Vercel 自動處理
};

export default nextConfig;
