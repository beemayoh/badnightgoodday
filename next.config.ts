import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure index.html is bundled with the serverless function for the / route
  outputFileTracingIncludes: {
    "/": ["./index.html"],
  },
};

export default nextConfig;
