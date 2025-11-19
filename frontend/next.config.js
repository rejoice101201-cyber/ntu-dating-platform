/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Exclude problematic directories from build tracing, but keep essential dependencies
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        '**/node_modules/@swc/**',
        '**/node_modules/.cache/**',
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

