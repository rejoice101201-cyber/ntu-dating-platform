import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [],
    remotePatterns: [],
  },
  // 添加空的 turbopack 配置以解決 Next.js 16 的 Turbopack 警告
  turbopack: {},
};

export default nextConfig;
