/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Exclude only problematic packages from file tracing to avoid stack overflow
  // while keeping essential dependencies like styled-jsx
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        '**/node_modules/@swc/**',
        '**/node_modules/.cache/**',
        '**/node_modules/.bin/**',
        '**/.next/cache/**',
        '**/prisma/migrations/**',
      ],
    },
  },
  // Exclude problematic directories from build
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
}

module.exports = nextConfig

