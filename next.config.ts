import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:49621"],
    },
  },
  crossOrigin: "anonymous",
};

export default nextConfig;
