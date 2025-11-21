import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning by accepting current working directory
  // The warning is harmless - it's due to having package.json in both root and app/
  // To fully resolve: remove root package-lock.json if not needed

  // Performance optimizations
  poweredByHeader: false,

  // Compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Experimental performance features
  experimental: {
    optimizeCss: true,
  },

  // Bundle analyzer (optional - enable in production)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.optimization.splitChunks.cacheGroups = {
  //       ...config.optimization.splitChunks.cacheGroups,
  //       d3: {
  //         test: /[\\/]node_modules[\\/]d3.*[\\/]/,
  //         name: 'd3',
  //         chunks: 'all',
  //         priority: 30,
  //       },
  //       charts: {
  //         test: /[\\/]node_modules[\\/](recharts|chart\.js)[\\/]/,
  //         name: 'charts',
  //         chunks: 'all',
  //         priority: 20,
  //       },
  //     };
  //   }
  //   return config;
  // },
};

export default nextConfig;
