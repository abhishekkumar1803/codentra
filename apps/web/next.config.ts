import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@codentra/ui', '@codentra/types'],
  reactStrictMode: true,
  // Avoid stale webpack chunks when dev + production builds mix
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/.git/**', '**/node_modules/**', '**/.next/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
