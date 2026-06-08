import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle public/index.html with the serverless function for the / route
  outputFileTracingIncludes: {
    "/": ["./public/index.html"],
  },
};

export default nextConfig;
