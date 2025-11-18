import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning by accepting current working directory
  // The warning is harmless - it's due to having package.json in both root and app/
  // To fully resolve: remove root package-lock.json if not needed
};

export default nextConfig;
