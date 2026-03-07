import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {},

  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.5.0',
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules', 
          '**/.next',
          '**/*.db', 
          '**/*.db-journal', 
          '**/*.sqlite', 
          '**/*.sqlite-journal',
          '**/prisma/*.db*',
          '**/dev.db*'
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
