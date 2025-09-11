import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['jsonwebtoken'],
    turbo: {
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    }
  },
  // Ensure jsonwebtoken is treated as external for server-side
  serverExternalPackages: ['jsonwebtoken']
};

export default nextConfig;
