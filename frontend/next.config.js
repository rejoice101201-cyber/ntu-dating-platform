/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Completely disable output file tracing to avoid stack overflow
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        '**/node_modules/**',
        '**/.next/**',
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

