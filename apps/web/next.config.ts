import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@codentra/ui', '@codentra/types'],
  reactStrictMode: true,
};

export default nextConfig;
