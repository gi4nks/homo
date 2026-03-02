import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {},

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules', 
          '**/*.db', 
          '**/*.sqlite', 
          '**/*.db-journal', 
          '**/prisma/*.db'
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
